// lib/feeds.js — RSS feed sources and article fetching

import Parser from 'rss-parser'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; EasyDollarNewsBot/1.0; +https://easydollar-news.pt)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 8000,
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
    ],
  },
})

// All RSS feeds — add more sources here as the site grows
export const FEED_SOURCES = [
  // ── Crypto ──────────────────────────────────────────────────────
  {
    url: 'https://cointelegraph.com/rss',
    source: 'CoinTelegraph',
    category: 'crypto',
    lang: 'en',
  },
  {
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    source: 'CoinDesk',
    category: 'crypto',
    lang: 'en',
  },
  {
    url: 'https://decrypt.co/feed',
    source: 'Decrypt',
    category: 'crypto',
    lang: 'en',
  },

  // ── Stocks / Ações ───────────────────────────────────────────────
  {
    url: 'https://finance.yahoo.com/news/rssindex',
    source: 'Yahoo Finance',
    category: 'acoes',
    lang: 'en',
  },
  {
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    source: 'CNBC Markets',
    category: 'acoes',
    lang: 'en',
  },

  // ── Commodities ─────────────────────────────────────────────────
  {
    url: 'https://oilprice.com/rss/main',
    source: 'Kitco',
    category: 'commodities',
    lang: 'en',
  },

  // ── General Markets / Forex ──────────────────────────────────────
  {
    url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html',
    source: 'Investing.com',
    category: 'mercados',
    lang: 'en',
  },
  {
    url: 'https://www.forexlive.com/feed/news',
    source: 'DailyFX',
    category: 'forex',
    lang: 'en',
  },

  // ── Mercados Emergentes (Portuguese-language sources) ────────────
  {
    url: 'https://valoreconomico.com.br/rss',
    source: 'Valor Econômico',
    category: 'emergentes',
    lang: 'en',
  },
  // Jornal de Negócios (Portugal) — add when confirmed working
  { url: 'https://www.jornaldenegocios.pt/rss', source: 'Jornal de Negócios', category: 'emergentes', lang: 'pt' },
]

// Keywords that override category assignment
const CATEGORY_KEYWORDS = {
  crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi', 'nft', 'solana', 'xrp', 'ripple', 'altcoin', 'web3', 'binance', 'coinbase'],
  acoes: ['stock', 'shares', 'nasdaq', 'nyse', 'tesla', 'nvidia', 'apple', 'amazon', 'microsoft', 'earnings', 'ipo', 's&p', 'dow jones'],
  forex: ['forex', 'currency', 'eur/usd', 'gbp/usd', 'usd/jpy', 'dollar', 'euro', 'pound', 'yen', 'fed', 'ecb', 'interest rate', 'central bank'],
  commodities: ['gold', 'silver', 'oil', 'crude', 'copper', 'wheat', 'corn', 'natural gas', 'wti', 'brent', 'opec'],
  emergentes: ['brazil', 'brasil', 'portugal', 'angola', 'mozambique', 'moçambique', 'ibovespa', 'real', 'petrobras', 'embraer', 'brics', 'emerging market'],
}

function detectCategory(title = '', defaultCategory = 'mercados') {
  const lower = title.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat
  }
  return defaultCategory
}

function extractImage(item) {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url) return item.enclosure.url
  // Extract first image from content if available
  if (item.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (match) return match[1]
  }
  return null
}

function cleanSummary(text = '') {
  return text
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

// Fetch a single feed — returns [] on error so one failure doesn't break everything
async function fetchFeed(feedSource) {
  try {
    const feed = await parser.parseURL(feedSource.url)
    return (feed.items || []).slice(0, 8).map(item => ({
      id: item.guid || item.link || item.title,
      title: (item.title || '').trim(),
      summary: cleanSummary(item.contentSnippet || item.content || item.summary || ''),
      url: item.link || '',
      image: extractImage(item),
      source: feedSource.source,
      category: detectCategory(item.title, feedSource.category),
      lang: feedSource.lang,
      pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
    }))
  } catch (err) {
    console.warn(`[feeds] Failed to fetch ${feedSource.source}: ${err.message}`)
    return []
  }
}

// Fetch all feeds in parallel, return flat sorted array
export async function fetchAllArticles() {
  const results = await Promise.allSettled(FEED_SOURCES.map(fetchFeed))

  const articles = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .filter(a => a.title && a.url)
    // Deduplicate by URL
    .filter((a, i, arr) => arr.findIndex(b => b.url === a.url) === i)
    // Sort newest first
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  return articles
}
