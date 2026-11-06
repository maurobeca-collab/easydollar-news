// lib/translate.js — DeepL translation (free tier)
// Translates English article titles and summaries to Portuguese (PT-PT)

const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'
const DEEPL_KEY = process.env.DEEPL_API_KEY

// In-memory cache: avoids re-translating the same text within a revalidation cycle
const cache = new Map()

// Translate an array of strings from English to Portuguese in one API call
// Returns array of translated strings in the same order
export async function translateBatch(texts) {
  if (!DEEPL_KEY) {
    console.warn('[translate] DEEPL_API_KEY not set — skipping translation')
    return texts
  }

  // Check which texts are already cached
  const toTranslate = []
  const indexMap = []   // maps position in toTranslate → position in texts

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    if (!text || cache.has(text)) {
      // already cached or empty — skip
    } else {
      indexMap.push(i)
      toTranslate.push(text)
    }
  }

  // Fetch translations for uncached texts
  if (toTranslate.length > 0) {
    try {
      const res = await fetch(DEEPL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: toTranslate,
          source_lang: 'EN',
          target_lang: 'PT-PT',
        }),
        signal: AbortSignal.timeout(8000),
      })

      if (res.ok) {
        const json = await res.json()
        const translations = json.translations || []
        translations.forEach((t, i) => {
          const originalIndex = indexMap[i]
          cache.set(texts[originalIndex], t.text)
        })
      } else {
        const err = await res.text()
        console.warn(`[translate] DeepL error ${res.status}: ${err.slice(0, 100)}`)
      }
    } catch (e) {
      console.warn(`[translate] DeepL fetch failed: ${e.message}`)
    }
  }

  // Return results using cache (falls back to original if translation failed)
  return texts.map(t => cache.get(t) || t)
}

// Translate articles that are in English — leaves Portuguese ones untouched
export async function translateArticles(articles) {
  const englishArticles = articles.filter(a => a.lang === 'en')
  if (englishArticles.length === 0) return articles

  // Collect all titles and summaries to translate in one batch
  const titlesToTranslate  = englishArticles.map(a => a.title)
  const summariesToTranslate = englishArticles.map(a => a.summary)

  // One batch call for all titles, one for summaries
  const [translatedTitles, translatedSummaries] = await Promise.all([
    translateBatch(titlesToTranslate),
    translateBatch(summariesToTranslate),
  ])

  // Build a map for quick lookup
  const titleMap   = new Map(englishArticles.map((a, i) => [a.id, translatedTitles[i]]))
  const summaryMap = new Map(englishArticles.map((a, i) => [a.id, translatedSummaries[i]]))

  // Apply translations
  return articles.map(a => {
    if (a.lang !== 'en') return a
    return {
      ...a,
      title:   titleMap.get(a.id)   || a.title,
      summary: summaryMap.get(a.id) || a.summary,
    }
  })
}

