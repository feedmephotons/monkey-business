'use client'

import { useState, useTransition } from 'react'
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
        font_color: fontColor,
        bg_color: bgColor,
        font_family: font,
        is_bad_beat: isBadBeat,
      })
      if (res.ok) {
        setMessage('')
        setAuthor('')
        setStatus('✓ tacked to the wall')
      } else {
        setStatus(res.error)
      }
    })
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_minmax(260px,320px)]">
      {/* LIVE PREVIEW */}
      <div className="order-2 md:order-1">
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
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream/50 font-[family-name:var(--font-mono)]">
          live preview
        </p>
      </div>

      {/* CONTROLS */}
      <div className="order-1 md:order-2 space-y-4">
        <div>
          <label className="block text-[0.7rem] uppercase tracking-[0.18em] text-banana/80 mb-1 font-[family-name:var(--font-mono)]">
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
          <label className="block text-[0.7rem] uppercase tracking-[0.18em] text-banana/80 mb-1 font-[family-name:var(--font-mono)]">
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

        <button
          type="button"
          onClick={submit}
          disabled={pending || !message.trim()}
          className="w-full relative overflow-hidden rounded bg-gradient-to-b from-banana-bright to-gold text-felt-deep font-[family-name:var(--font-display)] text-xl py-3 tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_14px_32px_-10px_rgba(244,196,48,0.55)] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? 'TACKING…' : 'TACK IT UP'}
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
