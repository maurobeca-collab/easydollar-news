// app/page.js — Home page (Server Component with ISR)
// News is fetched server-side and revalidated every 15 minutes.
// The price ticker is client-side and updates every 60 seconds.

import { fetchAllArticles } from '@/lib/feeds'
import { translateArticles } from '@/lib/translate'
import Header from '@/components/Header'
import PriceTicker from '@/components/PriceTicker'
import NewsSection from '@/components/NewsSection'
import Footer from '@/components/Footer'
import styles from './page.module.css'

// ISR: regenerate the page every 15 minutes in the background
export const revalidate = parseInt(process.env.NEWS_REVALIDATE_SECONDS || '900')

async function getArticles() {
  try {
    const raw = await fetchAllArticles()
    const articles = await translateArticles(raw, 5)
    return articles
  } catch (err) {
    console.error('[page] Failed to fetch articles:', err)
    return []
  }
}

export default async function HomePage() {
  const articles = await getArticles()

  // Top 3 articles for the breaking marquee (newest across all categories)
  const topHeadlines = articles
    .slice(0, 10)
    .map(a => a.title)
    .join(' · ')

  return (
    <>
      <Header />

      {/* Breaking news marquee */}
      {topHeadlines && (
        <div className={styles.breaking}>
          <div className="w">
            <span className={styles.brkLabel}>🔴 Urgente</span>
            <div className={styles.brkScroll}>
              <span className={styles.brkInner}>
                {topHeadlines} &nbsp;·&nbsp; {topHeadlines}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live price ticker (client component — updates every 60s) */}
      <PriceTicker />

      {/* Main news section with category filtering (client component) */}
      <NewsSection articles={articles} />

      {/* CTA banner */}
      <div className={styles.ctaBanner}>
        <div className="w">
          <div className={styles.ctaInner}>
            <div>
              <strong>Faça mais com o seu dinheiro</strong>
              <p>Aceda à plataforma EasyDollar e acompanhe os mercados com ferramentas profissionais.</p>
            </div>
            <a href="https://easy-dollar.com" target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
              Aceder à Plataforma →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
