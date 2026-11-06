'use client'

import { useEffect, useState } from 'react'
import styles from './PriceTicker.module.css'

// Fallback static prices shown before API data loads
const FALLBACK = [
  { sym: 'BTC',    name: 'Bitcoin',   price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'ETH',    name: 'Ethereum',  price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'SOL',    name: 'Solana',    price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'XRP',    name: 'XRP',       price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'BNB',    name: 'BNB',       price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'DOGE',   name: 'Dogecoin',  price: '—',    change: '—',    up: true,  type: 'crypto' },
  { sym: 'EUR/USD',name: 'EUR/USD',   price: '—',    change: '—',    up: false, type: 'forex' },
  { sym: 'GBP/USD',name: 'GBP/USD',  price: '—',    change: '—',    up: false, type: 'forex' },
  { sym: 'GOLD',   name: 'Ouro',      price: '—',    change: '—',    up: true,  type: 'commodity' },
  { sym: 'OIL',    name: 'Petróleo',  price: '—',    change: '—',    up: false, type: 'commodity' },
]

export default function PriceTicker() {
  const [prices, setPrices] = useState(FALLBACK)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices')
        if (!res.ok) return
        const data = await res.json()
        if (data.prices?.length) setPrices(data.prices)
      } catch {}
    }

    fetchPrices()
    // Refresh every 60 seconds
    const id = setInterval(fetchPrices, 60_000)
    return () => clearInterval(id)
  }, [])

  // Duplicate for seamless loop
  const items = [...prices, ...prices]

  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className="w">
        <div className={styles.track}>
          {items.map((p, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.sym}>{p.sym}</span>
              <span className={styles.price}>{p.price}</span>
              {p.change && p.change !== '—' && (
                <span className={`${styles.chg} ${p.up ? styles.up : styles.dn}`}>
                  {p.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
