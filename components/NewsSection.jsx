'use client'

import { useState } from 'react'
import styles from './NewsSection.module.css'

const CATEGORIES = [
  { id: 'all',         label: 'Tudo' },
  { id: 'crypto',      label: 'Cripto' },
  { id: 'acoes',       label: 'Ações' },
  { id: 'forex',       label: 'Forex' },
  { id: 'commodities', label: 'Commodities' },
  { id: 'mercados',    label: 'Mercados' },
  { id: 'emergentes',  label: 'Mercados Emergentes' },
]

const TAG_CLASS = {
  crypto:      'tc',
  acoes:       'ta',
  forex:       'tf',
  commodities: 'tk',
  mercados:    'tm',
  emergentes:  'te',
}

const CAT_LABEL = {
  crypto:      'Cripto',
  acoes:       'Ações',
  forex:       'Forex',
  commodities: 'Commodities',
  mercados:    'Mercados',
  emergentes:  'Emergentes',
}

function timeAgo(isoDate) {
  if (!isoDate) return ''
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000
  if (diff < 60)   return 'Agora'
  if (diff < 3600) return `Há ${Math.round(diff / 60)}min`
  if (diff < 86400) return `Há ${Math.round(diff / 3600)}h`
  return `Há ${Math.round(diff / 86400)}d`
}

// ── Article Modal ──────────────────────────────────────────────
function ArticleModal({ article, onClose }) {
  if (!article) return null
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">✕</button>
        <div className={styles.modalInner}>
          <span className={`tag ${TAG_CLASS[article.category] || 'tm'}`} style={{ marginBottom: 14, display: 'inline-block' }}>
            {CAT_LABEL[article.category] || article.category}
          </span>
          <h2 className={styles.modalTitle}>{article.title}</h2>
          <div className="ameta" style={{ marginBottom: 20 }}>
            <span className="src">{article.source}</span>
            <span className="dot">·</span>
            <span>{timeAgo(article.pubDate)}</span>
          </div>
          {article.summary && (
            <p className={styles.modalSummary}>{article.summary}</p>
          )}
          <a
            href={`https://translate.google.com/translate?sl=en&tl=pt&u=${encodeURIComponent(article.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalReadBtn}
          >
            Ler Artigo Completo em Português →
          </a>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.modalSourceLink}
          >
            Fonte original: {article.source}
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Cards ──────────────────────────────────────────────────────
function ArticleCard({ article, onClick }) {
  return (
    <div onClick={() => onClick(article)} className={styles.card} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(article)}>
      <span className={`tag ${TAG_CLASS[article.category] || 'tm'}`}>
        {CAT_LABEL[article.category] || article.category}
      </span>
      <div className={styles.cardTitle}>{article.title}</div>
      {article.summary && <p className={styles.cardSummary}>{article.summary}</p>}
      <div className="ameta" style={{ marginTop: 'auto' }}>
        <span className="src">{article.source}</span>
        <span className="dot">·</span>
        <span>{timeAgo(article.pubDate)}</span>
      </div>
    </div>
  )
}

// ── Main Section ───────────────────────────────────────────────
export default function NewsSection({ articles = [] }) {
  const [active, setActive]     = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = active === 'all' ? articles : articles.filter(a => a.category === active)
  const hero = filtered.slice(0, 3)
  const grid = filtered.slice(3)

  return (
    <section>
      {/* Modal */}
      <ArticleModal article={selected} onClose={() => setSelected(null)} />

      {/* Category nav */}
      <nav className={styles.catNav} aria-label="Filtrar por categoria">
        <div className="w">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${active === cat.id ? styles.catActive : ''}`}
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.mainWrap}>
        <div className="w">
          <div className={styles.layout}>
            {/* Left column */}
            <div>
              {/* Hero grid */}
              {hero.length > 0 && (
                <div className={styles.heroGrid}>
                  {hero[0] && (
                    <div onClick={() => setSelected(hero[0])} className={styles.heroMain} role="button" tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setSelected(hero[0])}>
                      <div className={styles.heroBg} aria-hidden="true">
                        <svg viewBox="0 0 400 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="0,220 40,200 80,210 120,160 160,170 200,120 240,130 280,80 320,60 360,40 400,20" fill="none" stroke="#00e87a" strokeWidth="2"/>
                          <polygon points="0,220 40,200 80,210 120,160 160,170 200,120 240,130 280,80 320,60 360,40 400,20 400,300 0,300" fill="url(#ghero)" opacity=".4"/>
                          <defs>
                            <linearGradient id="ghero" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00e87a" stopOpacity=".3"/>
                              <stop offset="100%" stopColor="#00e87a" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <span className={`tag ${TAG_CLASS[hero[0].category] || 'tm'}`}>{CAT_LABEL[hero[0].category] || hero[0].category}</span>
                      <h2 className={styles.heroMainTitle}>{hero[0].title}</h2>
                      {hero[0].summary && <p className={styles.heroSummary}>{hero[0].summary}</p>}
                      <div className="ameta">
                        <span className="src">{hero[0].source}</span>
                        <span className="dot">·</span>
                        <span>{timeAgo(hero[0].pubDate)}</span>
                      </div>
                    </div>
                  )}
                  <div className={styles.heroSides}>
                    {hero.slice(1).map((a, i) => (
                      <div key={i} onClick={() => setSelected(a)} className={styles.heroSide} role="button" tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelected(a)}>
                        <span className={`tag ${TAG_CLASS[a.category] || 'tm'}`}>{CAT_LABEL[a.category] || a.category}</span>
                        <div className={styles.heroSideTitle}>{a.title}</div>
                        <div className="ameta">
                          <span className="src">{a.source}</span>
                          <span className="dot">·</span>
                          <span>{timeAgo(a.pubDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News grid */}
              {grid.length > 0 && (
                <>
                  <div className="sh"><div className="sh-bar"></div><h2>Últimas Notícias</h2></div>
                  <div className={styles.newsGrid}>
                    {grid.map((a, i) => <ArticleCard key={i} article={a} onClick={setSelected} />)}
                  </div>
                </>
              )}

              {filtered.length === 0 && (
                <div className={styles.empty}>A carregar notícias…</div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={`${styles.sidebar} hide-mobile`}>
              <LiveFeedSidebar articles={articles.slice(0, 10)} onSelect={setSelected} />
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Live feed sidebar ──────────────────────────────────────────
function LiveFeedSidebar({ articles, onSelect }) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHead}><span>Feed ao Vivo</span></div>
      {articles.map((a, i) => (
        <div key={i} onClick={() => onSelect(a)} className={styles.feedItem} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(a)}>
          <span className={styles.feedCat}>
            <span className={`tag ${TAG_CLASS[a.category] || 'tm'}`} style={{ fontSize: '8px' }}>
              {CAT_LABEL[a.category]?.slice(0, 4) || '—'}
            </span>
          </span>
          <div className={styles.feedBody}>
            <div className={styles.feedTitle}>{a.title}</div>
            <div className={styles.feedMeta}>{a.source} · {timeAgo(a.pubDate)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
