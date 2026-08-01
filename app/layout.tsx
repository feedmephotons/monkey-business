import type { Metadata } from 'next'
import { Monoton, Rozha_One, EB_Garamond, JetBrains_Mono, Caveat, Eater } from 'next/font/google'
import './globals.css'

const monoton = Monoton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const eater = Eater({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-scary',
  display: 'swap',
})

const rozha = Rozha_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Monkey Business — A Private Poker Lounge',
  description:
    "Monkey Mania Week. Freerolls, splash pots, high hands and the wildest wall in poker.",
  openGraph: {
    title: 'Monkey Business — A Private Poker Lounge',
    description: "Monkey Mania Week. Freerolls, splash pots, high hands and the wildest wall in poker.",
    url: 'https://monkeybizpoker.com',
    siteName: 'Monkey Business',
    images: [
      {
        url: 'https://monkeybizpoker.com/img/hero-contest-flyer.png',
        width: 1376,
        height: 768,
        alt: 'Splat a Bad Beat Contest - Monkey Business Poker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monkey Business — A Private Poker Lounge',
    description: "Monkey Mania Week. Freerolls, splash pots, high hands and the wildest wall in poker.",
    images: ['https://monkeybizpoker.com/img/hero-contest-flyer.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${monoton.variable} ${rozha.variable} ${garamond.variable} ${mono.variable} ${caveat.variable} ${eater.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
