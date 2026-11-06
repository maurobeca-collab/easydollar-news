// app/api/news/route.js — Aggregates RSS feeds and translates to Portuguese
// Called client-side for live refreshes; also used by the server component

import { NextResponse } from 'next/server'
import { fetchAllArticles } from '@/lib/feeds'
import { translateArticles } from '@/lib/translate'

export const revalidate = parseInt(process.env.NEWS_REVALIDATE_SECONDS || '900')
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch all RSS feeds
    const raw = await fetchAllArticles()

    // Translate to Portuguese (only English articles; PT articles pass through)
    const articles = await translateArticles(raw, 5)

    return NextResponse.json(
      { articles, fetchedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': `s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
        },
      }
    )
  } catch (err) {
    console.error('[api/news] Error:', err)
    return NextResponse.json({ articles: [], error: err.message }, { status: 500 })
  }
}
