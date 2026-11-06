// app/api/prices/route.js — Live market prices via CoinGecko (free, no key needed)

import { NextResponse } from 'next/server'

export const revalidate = 60 // refresh prices every 60 seconds

// CoinGecko coin IDs to fetch
const COINGECKO_IDS = 'bitcoin,ethereum,binancecoin,solana,ripple,dogecoin,avalanche-2,chainlink'

// Static forex + equity data (replace with a paid API when ready)
// CoinGecko free tier doesn't include stocks/forex
const STATIC_MARKET_DATA = [
  { sym: 'EUR/USD', name: 'Euro / Dólar', price: null, change: null, type: 'forex' },
  { sym: 'GBP/USD', name: 'Libra / Dólar', price: null, change: null, type: 'forex' },
  { sym: 'USD/JPY', name: 'Dólar / Iene', price: null, change: null, type: 'forex' },
  { sym: 'GOLD', name: 'Ouro', price: null, change: null, type: 'commodity' },
  { sym: 'OIL', name: 'Petróleo WTI', price: null, change: null, type: 'commodity' },
  { sym: 'S&P500', name: 'S&P 500', price: null, change: null, type: 'index' },
  { sym: 'NASDAQ', name: 'Nasdaq', price: null, change: null, type: 'index' },
]

const COIN_DISPLAY = {
  bitcoin: { sym: 'BTC', name: 'Bitcoin' },
  ethereum: { sym: 'ETH', name: 'Ethereum' },
  binancecoin: { sym: 'BNB', name: 'BNB' },
  solana: { sym: 'SOL', name: 'Solana' },
  ripple: { sym: 'XRP', name: 'XRP' },
  dogecoin: { sym: 'DOGE', name: 'Dogecoin' },
  'avalanche-2': { sym: 'AVAX', name: 'Avalanche' },
  chainlink: { sym: 'LINK', name: 'Chainlink' },
}

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (price >= 1) return price.toFixed(2)
  return price.toFixed(4)
}

export async function GET() {
  try {
    // Fetch crypto prices from CoinGecko (free, no API key)
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true`
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    })

    const data = await res.json()

    const cryptoPrices = Object.entries(data).map(([id, vals]) => {
      const display = COIN_DISPLAY[id] || { sym: id.toUpperCase(), name: id }
      const change = vals.usd_24h_change ?? 0
      return {
        sym: display.sym,
        name: display.name,
        price: `$${formatPrice(vals.usd)}`,
        change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
        up: change >= 0,
        type: 'crypto',
      }
    })

    return NextResponse.json(
      { prices: [...cryptoPrices, ...STATIC_MARKET_DATA], fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    return NextResponse.json({ prices: [], error: err.message }, { status: 500 })
  }
}
