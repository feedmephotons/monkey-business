'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { postToWall } from '@/app/actions'

const FONT_COLORS = [
  '#f4c430', // banana
  '#ffdd33', // banana bright
  '#7eb8ff', // neon blue
  '#ff6b6b', // pink
  '#ff8c42', // orange
  '#f6ecc9', // cream
  '#ffffff', // white
  '#000000', // black
]

const BG_COLORS = [
  '#0a1f3d', // felt
  '#122a4c', // felt light
  '#1e3b6b', // jungle
  '#382058', // oak
  '#8a0000', // deep red
  '#3a1a5c', // purple
  '#f4c430', // banana
  '#1a1a0f', // smoke
]

const FONTS: { key: 'display' | 'serif' | 'mono' | 'hand'; label: string; className: string }[] = [
  { key: 'display', label: 'NEON', className: 'font-[family-name:var(--font-display)]' },
  { key: 'serif', label: 'Elegant', className: 'font-[family-name:var(--font-headline)]' },
  { key: 'mono', label: 'MONO', className: 'font-[family-name:var(--font-mono)]' },
  { key: 'hand', label: 'Scribble', className: 'font-[family-name:var(--font-hand)]' },
]

export default function WallForm({ isBadBeat = false, placeholder }: { isBadBeat?: boolean; placeholder?: string }) {
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [fontColor, setFontColor] = useState(FONT_COLORS[0])
  const [bgColor, setBgColor] = useState(BG_COLORS[0])
  const [font, setFont] = useState<(typeof FONTS)[number]['key']>('display')
  const [status, setStatus] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const currentFont = FONTS.find((f) => f.key === font)!

  const submit = () => {
    setStatus(null)
    startTransition(async () => {
      const res = await postToWall({
        author,
        message,
        font_color: isBadBeat ? '#ffffff' : fontColor,
        bg_color: isBadBeat ? '#1a1a0f' : bgColor,
        font_family: isBadBeat ? 'display' : font,
        is_bad_beat: isBadBeat,
      })
      if (res.ok) {
        setMessage('')
        setAuthor('')
        setStatus(isBadBeat ? '✓ splattered onto the wall' : '✓ tacked to the wall')
      } else {
        setStatus(res.error)
      }
    })
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_minmax(260px,320px)]">
      {/* LIVE PREVIEW */}
      <div className="order-2 md:order-1">
        {isBadBeat ? (
          /* EXCLUSIVE DEDICATED BAD BEAT LIVE PREVIEW CARD */
          <div
            className="wall-card min-h-[220px] flex flex-col justify-between relative overflow-visible transition-all duration-200 border-2 border-yellow shadow-[0_0_20px_rgba(255,209,59,0.35)] bg-[#0f0f0f] rounded-xl pt-6 px-4 pb-4"
            style={{ transform: 'rotate(-1deg)' }}
          >
            {/* Dripping puddle */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-52 h-14 z-20 pointer-events-none select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
              <svg viewBox="0 0 120 30" width="100%" height="100%">
                <path d="M 8,12 C 12,4 108,4 112,12 C 116,18 108,26 98,24 C 94,30 90,30 87,24 C 81,24 76,28 73,20 C 67,29 55,29 49,20 C 43,29 36,27 33,20 C 27,27 18,23 8,12" fill="#ffd13b" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
                <text x="60" y="19" fill="#000000" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="8.5" textAnchor="middle" letterSpacing="0.3">BAD BEAT!</text>
                <path d="M 80,10 C 76,8 70,11 68,13 C 70,12 73,10 80,10" stroke="#000000" strokeWidth="1" fill="#ffd13b" />
              </svg>
            </div>

            {/* Dripping bottom border */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[101.5%] h-6 z-20 pointer-events-none select-none">
              <svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none">
                <path d="M 0,0 L 100,0 C 92,0 88,7 85,2 C 79,2 75,9 71,2 C 63,2 59,10 55,2 C 48,2 43,9 39,2 C 33,2 29,10 25,2 C 19,2 14,7 10,1 L 0,0 Z" fill="#ffd13b" stroke="#ffd13b" strokeWidth="0.3" />
              </svg>
            </div>

            <div>
              {/* Header with Circular Logo */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-yellow/30 relative shrink-0">
                  <Image src="/img/logo.png" alt="Logo" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white/90">@Monkeybizpoker</div>
                  <div className="text-[0.65rem] text-white/50 uppercase tracking-widest font-mono">Telegram submission</div>
                </div>
              </div>

              {/* Message */}
              <div className="leading-snug break-words font-[family-name:var(--font-display)] text-white">
                {message ? (
                  <p className="text-xl md:text-2xl">{message}</p>
                ) : (
                  <div className="flex flex-col items-center text-center py-2">
                    <p className="text-xl md:text-2xl uppercase font-black text-white/95 leading-tight">
                      Paste your PokerBros replay link <span className="text-yellow drop-shadow-[0_0_8px_rgba(255,209,59,0.7)] animate-pulse">above</span>…
                    </p>
                    <div className="text-xl text-yellow drop-shadow-[0_0_12px_rgba(255,209,59,0.9)] font-black my-1 animate-bounce">
                      ▲ ▲ ▲
                    </div>
                    <p className="text-xs uppercase tracking-widest text-banana/80 font-mono font-bold mt-1">
                      This is a contest for $25 a week!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Faint footer signature */}
            <div className="mt-4 text-right">
              <span className="font-[family-name:var(--font-hand)] text-lg text-yellow opacity-80">
                — {author || 'Monkey in the middle'}
              </span>
            </div>
          </div>
        ) : (
          /* STANDARD PAGE PREVIEW CARD */
          <div
            className="wall-card min-h-[180px]"
            style={{
              background: bgColor,
              transform: 'rotate(-1deg)',
            }}
          >
            <p
              className={`text-xl md:text-2xl leading-snug break-words ${currentFont.className}`}
              style={{ color: fontColor }}
            >
              {message || 'Your masterpiece appears here…'}
            </p>
            <p
              className="mt-4 font-[family-name:var(--font-hand)] text-xl opacity-80"
              style={{ color: fontColor }}
            >
              — {author || 'Anon Monkey'}
            </p>
          </div>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream/50 font-[family-name:var(--font-mono)]">
          live preview
        </p>
      </div>

      {/* CONTROLS */}
      <div className="order-1 md:order-2 space-y-4">
        <div>
          <label className={`block text-[0.7rem] uppercase tracking-[0.18em] mb-1 font-[family-name:var(--font-mono)] ${isBadBeat ? 'text-yellow' : 'text-banana/80'}`}>
            Signed
          </label>
          <input
            className="jungle-input w-full"
            placeholder={isBadBeat ? "Screen name here" : "Lucky Lou"}
            maxLength={40}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div>
          <label className={`block text-[0.7rem] uppercase tracking-[0.18em] mb-1 font-[family-name:var(--font-mono)] ${isBadBeat ? 'text-yellow' : 'text-banana/80'}`}>
            Message
          </label>
          <textarea
            className="jungle-input w-full min-h-[96px] resize-none"
            placeholder={placeholder || "How's the air up there, Mr. High Hand?"}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="text-right text-[0.65rem] text-cream/40 font-[family-name:var(--font-mono)]">
            {message.length}/500
          </div>
        </div>

        {/* ONLY RENDER FONT / INK / PAPER SELECTORS FOR GENERAL CHAT POSTS */}
        {!isBadBeat && (
          <>
            <div>
              <label className="block text-[0.7rem] uppercase tracking-[0.18em] text-banana/80 mb-1 font-[family-name:var(--font-mono)]">
                Font
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {FONTS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFont(f.key)}
                    className={`py-2 px-1 text-xs rounded border transition ${
                      font === f.key
                        ? 'bg-banana text-felt-deep border-banana'
                        : 'bg-felt-deep/60 text-cream/70 border-gold/30 hover:border-gold'
                    } ${f.className}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] uppercase tracking-[0.18em] text-banana/80 mb-1 font-[family-name:var(--font-mono)]">
                Ink
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FONT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFontColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition touch-manipulation ${
                      fontColor === c ? 'scale-110 border-cream' : 'border-gold/30'
                    }`}
                    style={{ background: c }}
                    aria-label={`ink ${c}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] uppercase tracking-[0.18em] text-banana/80 mb-1 font-[family-name:var(--font-mono)]">
                Paper
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={`w-10 h-10 rounded border-2 transition touch-manipulation ${
                      bgColor === c ? 'scale-110 border-cream' : 'border-gold/30'
                    }`}
                    style={{ background: c }}
                    aria-label={`paper ${c}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending || !message.trim()}
          className={`w-full relative overflow-hidden rounded text-white font-[family-name:var(--font-display)] text-xl py-3 tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_14px_32px_-10px_rgba(244,196,48,0.55)] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] transition disabled:opacity-40 disabled:cursor-not-allowed ${
            isBadBeat 
              ? 'bg-[linear-gradient(270deg,#ffea3b,#ffbc00,#ffd13b,#ffea3b)] animate-slime-melt border-2 border-yellow shadow-[0_0_22px_rgba(255,188,0,0.65)] text-felt-deep font-black' 
              : 'bg-gradient-to-b from-banana-bright to-gold text-felt-deep shadow-[0_6px_0_rgba(0,0,0,0.35)]'
          }`}
        >
          {isBadBeat && (
            <div className="absolute top-0 inset-x-0 h-4 z-10 pointer-events-none select-none">
              <svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none">
                <path d="M 0,0 L 100,0 C 94,0 91,8 87,2 C 82,2 78,10 74,3 C 66,3 61,12 56,2 C 49,2 45,9 41,2 C 34,2 30,11 26,2 C 19,2 14,8 10,1 L 0,0 Z" fill="#fffb3b" />
              </svg>
            </div>
          )}
          <span className="relative z-20">
            {isBadBeat ? (pending ? 'SPLATTERING…' : 'SPLAT IT UP! 🍌') : (pending ? 'TACKING…' : 'TACK IT UP')}
          </span>
          <span className="shimmer absolute inset-0 pointer-events-none" />
        </button>
        {status && (
          <p className="text-sm text-center text-banana/90 font-[family-name:var(--font-hand)]">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
