'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const IOS_URL = 'https://apps.apple.com/us/app/pokerbros/id1465194546'
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.kpgame.PokerBros'
const FALLBACK_URL = 'https://www.pokerbros.com/'
const CLUB_LINK = 'https://i.pokerbros.net/D1LwWJqsU2b'

export default function PokerBrosFAB() {
  const [open, setOpen] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(FALLBACK_URL)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    // All download links should now go to the club referral link
    setDownloadUrl(CLUB_LINK)
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setPlatform('ios')
    } else if (/Android/i.test(ua)) {
      setPlatform('android')
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Floating banana CTA */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-gradient-to-b from-banana-bright to-gold text-felt-deep font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] font-bold animate-glow-pulse active:opacity-80 cursor-pointer select-none touch-manipulation"
        aria-label="Join on PokerBros"
      >
        <span className="text-xl leading-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>🍌</span>
        Club Info
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9991] flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="absolute inset-0 bg-smoke/80 backdrop-blur-sm" />

          <div className="relative w-full sm:max-w-md mx-auto bg-felt-deep border border-gold/40 rounded-t-2xl sm:rounded-2xl shadow-[0_-10px_60px_rgba(0,0,0,0.7)] max-h-[90svh] overflow-y-auto scroll-felt animate-[slide-up_0.3s_ease-out]">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream/10 text-cream/60 hover:text-cream hover:bg-cream/20 transition flex items-center justify-center text-lg"
              aria-label="Close"
            >
              &times;
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="font-[family-name:var(--font-display)] text-banana text-2xl neon tracking-wider">
                  JOIN THE CLUB
                </div>
                <p className="mt-2 font-[family-name:var(--font-body)] text-cream/70 italic text-sm">
                  Get on PokerBros and join Monkey Biz Poker in two taps.
                </p>
              </div>

              {/* Step 1 — Download */}
              <div className="rounded border border-gold/30 bg-felt-light/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-banana text-felt-deep text-xs font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">1</span>
                  <span className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.2em] text-banana">
                    Download PokerBros
                  </span>
                </div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-5 py-3 bg-gradient-to-b from-banana-bright to-gold text-felt-deep rounded font-[family-name:var(--font-display)] tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] transition"
                >
                  {platform === 'ios' ? 'APP STORE' : platform === 'android' ? 'GOOGLE PLAY' : 'DOWNLOAD APP'}
                </a>
                <p className="mt-2 text-center text-[0.65rem] text-cream/50 font-[family-name:var(--font-mono)]">
                  Free on {platform === 'ios' ? 'iPhone & iPad' : platform === 'android' ? 'Android' : 'iOS & Android'}
                </p>
              </div>

              {/* Step 2 — Join Club */}
              <div className="rounded border border-gold/30 bg-felt-light/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-banana text-felt-deep text-xs font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">2</span>
                  <span className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.2em] text-banana">
                    Join Monkey Biz Poker
                  </span>
                </div>
                <a
                  href={CLUB_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-5 py-3 border-2 border-banana text-banana rounded font-[family-name:var(--font-display)] tracking-wider hover:bg-banana/10 transition"
                >
                  OPEN CLUB LINK
                </a>
                <p className="mt-2 text-center text-[0.65rem] text-cream/50 font-[family-name:var(--font-mono)]">
                  This link auto-adds you to Monkey Biz Poker
                </p>
              </div>

              {/* Club details */}
              <div className="rounded border border-gold/30 bg-felt-light/30 p-4">
                <div className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.2em] text-banana mb-3">
                  Or join manually
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2 font-[family-name:var(--font-mono)] text-sm">
                    <div className="flex items-baseline gap-3">
                      <span className="text-cream/50 text-xs">Club ID</span>
                      <span className="text-banana-bright font-bold text-lg">1670819</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-20 h-20 rounded bg-white p-1">
                    <Image
                      src="/img/pokerbros-qr-official.png"
                      alt="Scan to join Monkey Biz Poker on PokerBros"
                      width={200}
                      height={200}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom safe area on mobile */}
            <div className="h-2 sm:hidden" />
          </div>
        </div>
      )}
    </>
  )
}
