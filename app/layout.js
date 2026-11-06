import './globals.css'

export const metadata = {
  title: 'EasyDollar News — Notícias Financeiras em Português',
  description: 'Crypto, acções, forex e commodities em tempo real para a comunidade lusófona. Portugal, Brasil e Mercados Emergentes.',
  keywords: 'notícias financeiras, bitcoin, bolsa, forex, ouro, petróleo, mercados emergentes, brasil, portugal',
  openGraph: {
    title: 'EasyDollar News',
    description: 'Notícias financeiras em português — Cripto, Acções, Forex e Commodities.',
    type: 'website',
    locale: 'pt_PT',
    siteName: 'EasyDollar News',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://easydollar-news.pt' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
