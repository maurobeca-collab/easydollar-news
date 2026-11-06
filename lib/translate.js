// lib/translate.js — Portuguese translation with DeepL (primary) + MyMemory (fallback)
//
// Translation is cached in-process during the ISR window to minimise API calls.
// Articles already in Portuguese (lang: 'pt') are passed through unchanged.

// In-process translation cache: maps original text → translated text
// Resets on cold starts but significantly reduces calls within a revalidation window
const cache = new Map()

// Translate a single string to Portuguese
async function translateText(text) {
  if (!text || text.length < 5) return text

  const cached = cache.get(text)
  if (cached) return cached

  // ── Option A: DeepL Free API ──────────────────────────────────────
  if (process.env.DEEPL_API_KEY) {
    try {
      const res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        },
        body: JSON.stringify({
          text: [text],
          target_lang: 'PT-PT', // European Portuguese; use 'PT-BR' for Brazilian
          source_lang: 'EN',
          split_sentences: '0',
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        const data = await res.json()
        const translated = data.translations?.[0]?.text
        if (translated) {
          cache.set(text, translated)
          return translated
        }
      } else if (res.status === 456) {
        // Quota exceeded — log once and fall through to MyMemory
        console.warn('[translate] DeepL quota exceeded, falling back to MyMemory')
      }
    } catch (err) {
      // Timeout or network error — fall through
    }
  }

  // ── Option B: MyMemory (free, no key needed; email = 10k chars/day) ──
  try {
    const email = process.env.MYMEMORY_EMAIL ? `&de=${encodeURIComponent(process.env.MYMEMORY_EMAIL)}` : ''
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|pt${email}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      const translated = data.responseData?.translatedText
      // MyMemory sometimes echoes back the original on failure
      if (translated && translated !== text && data.responseStatus === 200) {
        cache.set(text, translated)
        return translated
      }
    }
  } catch {}

  // ── Fallback: return original text ───────────────────────────────
  cache.set(text, text) // cache to avoid retrying the same text
  return text
}

// Translate title + summary of an article
// Articles already in Portuguese are returned as-is
export async function translateArticle(article) {
  if (article.lang === 'pt') return article

  // Translate title and summary in parallel
  const [title, summary] = await Promise.all([
    translateText(article.title),
    article.summary ? translateText(article.summary) : Promise.resolve(''),
  ])

  return { ...article, title, summary, translated: true }
}

// Translate an array of articles with controlled concurrency (max 5 at once)
// to avoid overwhelming the translation API
export async function translateArticles(articles, concurrency = 5) {
  const results = []

  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency)
    const translated = await Promise.all(batch.map(translateArticle))
    results.push(...translated)
  }

  return results
}
