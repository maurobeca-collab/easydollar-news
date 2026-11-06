// app/api/prices/route.js — Live market prices

import { NextResponse } from 'next/server'

export const revalidate = 60

// CoinGecko crypto IDs
const COINGECKO_IDS = 'bitcoin,ethereum,binancecoin,solana,ripple,dogecoin,avalanche-2,chainlink'

const COIN_DISPLAY = {
  bitcoin:       { sym: 'BTC',  name: 'Bitcoin' },
  ethereum:      { sym: 'ETH',  name: 'Ethereum' },
  binancecoin:   { sym: 'BNB',  name: 'BNB' },
  solana:        { sym: 'SOL',  name: 'Solana' },
  ripple:        { sym: 'XRP',  name: 'XRP' },
  dogecoin:      { sym: 'DOGE', name: 'Dogecoin' },
  'avalanche-2': { sym: 'AVAX', name: 'Avalanche' },
  chainlink:     { sym: 'LINK', name: 'Chainlink' },
}

// Yahoo Finance symbols for forex, commodities, indices
const YAHOO_SYMBOLS = [
  { ticker: 'EURUSD=X',  sym: 'EUR/USD', name: 'Euro / Dólar',    type: 'forex' },
  { ticker: 'GBPUSD=X',  sym: 'GBP/USD', name: 'Libra / Dólar',   type: 'forex' },
  { ticker: 'JPY=X',     sym: 'USD/JPY', name: 'Dólar / Iene',    type: 'forex' },
  { ticker: 'GC=F',      sym: 'GOLD',    name: 'Ouro',             type: 'commodity' },
  { ticker: 'CL=F',      sym: 'OIL',     name: 'Petróleo WTI',    type: 'commodity' },
  { ticker: '^GSPC',     sym: 'S&P500',  name: 'S&P 500',          type: 'index' },
  { ticker: '^IXIC',     sym: 'NASDAQ',  name: 'Nasdaq',           type: 'index' },
]

function formatPrice(price, type) {
  if (type === 'forex') return price.toFixed(4)
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 100)   return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return price.toFixed(2)
}

function fmtChange(pct) {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

async function fetchYahooPrices() {
  try {
    const tickers = YAHOO_SYMBOLS.map(s => s.ticker).join('%2C')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers}&fields=regularMarketPrice,regularMarketChangePercent`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const json = await res.json()
    const quotes = json?.quoteResponse?.result || []
    return quotes
  } catch {
    return null
  }
}

export async function GET() {
  try {
    // Fetch crypto + yahoo in parallel
    const [cryptoRes, yahooQuotes] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
      ).then(r => r.json()).catch(() => ({})),
      fetchYahooPrices(),
    ])

    // Build crypto prices
    const cryptoPrices = Object.entries(cryptoRes).map(([id, vals]) => {
      const display = COIN_DISPLAY[id] || { sym: id.toUpperCase(), name: id }
      const change = vals.usd_24h_change ?? 0
      return {
        sym: display.sym,
        name: display.name,
        price: `$${formatPrice(vals.usd, 'crypto')}`,
        change: fmtChange(change),
        up: change >= 0,
        type: 'crypto',
      }
    })

    // Build forex/commodity/index prices
    const marketPrices = YAHOO_SYMBOLS.map(item => {
      const quote = yahooQuotes?.find(q => q.symbol === item.ticker)
      const price = quote?.regularMarketPrice ?? null
      const pct   = quote?.regularMarketChangePercent ?? null
      const prefix = item.type === 'commodity' ? '$' : item.type === 'index' ? '' : ''
      return {
        sym:    item.sym,
        name:   item.name,
        price:  price != null ? `${prefix}${formatPrice(price, item.type)}` : null,
        change: pct   != null ? fmtChange(pct) : null,
        up:     pct   != null ? pct >= 0 : null,
        type:   item.type,
      }
    })

    return NextResponse.json(
      { prices: [...cryptoPrices, ...marketPrices], fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    return NextResponse.json({ prices: [], error: err.message }, { status: 500 })
  }
}
