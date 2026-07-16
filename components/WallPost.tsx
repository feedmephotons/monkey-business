'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import type { WallPost as WallPostType } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'
import { ratePost } from '@/app/actions'

function renderMiniCard(cardStr: string, isSmall = false) {
  // e.g. "10♥" or "A♠"
  const value = cardStr.slice(0, -1)
  const suit = cardStr.slice(-1)
  const isRed = suit === '♥' || suit === '♦'
  
  if (isSmall) {
    return (
      <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center shadow select-none">
        {value}
        <span className={`text-[0.4rem] leading-none ${isRed ? 'text-red-600' : ''}`}>{suit}</span>
      </span>
    )
  }
  
  return (
    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow select-none">
      {value}
      <span className={`text-[0.5rem] leading-none ${isRed ? 'text-red-600' : ''}`}>{suit}</span>
    </span>
  )
}

const FONT_CLASS: Record<WallPostType['font_family'], string> = {
  display: 'font-[family-name:var(--font-display)]',
  serif: 'font-[family-name:var(--font-headline)]',
  mono: 'font-[family-name:var(--font-mono)]',
  hand: 'font-[family-name:var(--font-hand)]',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

function renderMessageWithLinks(text: string, defaultColor: string, isBadBeat: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold transition duration-150 hover:opacity-80 break-all cursor-pointer relative z-30 font-sans normal-case"
          style={{ 
            color: isBadBeat ? '#ffd13b' : defaultColor,
            textTransform: 'none',
            fontFamily: 'sans-serif'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function WallPost({ post, index }: { post: EnrichedWallPost; index: number }) {
  const [isPending, startTransition] = useTransition()

  const handleRate = (tier: number) => {
    startTransition(async () => {
      await ratePost(post.id, tier)
    })
  }

  // Check if message contains a link
  const hasLink = post.message.includes('http://') || post.message.includes('https://')

  return (
    <div
      className={`wall-card rise flex flex-col justify-between h-full relative overflow-visible transition-all duration-200 ${
        post.is_bad_beat 
          ? 'border-2 border-yellow shadow-[0_0_20px_rgba(255,209,59,0.35)] bg-[#0f0f0f] rounded-xl' 
          : ''
      }`}
      style={{
        background: post.is_bad_beat ? undefined : post.bg_color,
        transform: `rotate(${post.rotation}deg)`,
        animationDelay: `${Math.min(index * 0.06, 0.9)}s`,
      }}
    >
      {/* 1. DRIPPING "BAD BEAT!" HEADER PUDDLE (FROM JOSH'S MOCKUP) */}
      {post.is_bad_beat && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-52 h-14 z-20 pointer-events-none select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 120 30" width="100%" height="100%">
            <path d="M 8,12 
                     C 12,4 108,4 112,12 
                     C 116,18 108,26 98,24 
                     C 94,30 90,30 87,24 
                     C 81,24 76,28 73,20
                     C 67,29 55,29 49,20
                     C 43,29 36,27 33,20
                     C 27,27 18,23 8,12" 
                  fill="#ffd13b" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
            <text x="60" y="19" fill="#000000" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="8.5" text-anchor="middle" letter-spacing="0.3">BAD BEAT!</text>
            <path d="M 80,10 C 76,8 70,11 68,13 C 70,12 73,10 80,10" stroke="#000000" stroke-width="1" fill="#ffd13b" />
          </svg>
        </div>
      )}

      {/* 2. DRIPPING YELLOW BOTTOM BORDER (FROM JOSH'S MOCKUP) */}
      {post.is_bad_beat && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[101.5%] h-6 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M 0,0 L 100,0 
                     C 92,0 88,7 85,2 
                     C 79,2 75,9 71,2
                     C 63,2 59,10 55,2
                     C 48,2 43,9 39,2
                     C 33,2 29,10 25,2
                     C 19,2 14,7 10,1
                     L 0,0 Z" 
                  fill="#ffd13b" stroke="#ffd13b" stroke-width="0.3" />
          </svg>
        </div>
      )}

      {/* CARD CONTENT */}
      <div className={post.is_bad_beat ? 'pt-6' : ''}>
        {/* User avatar / header if Bad Beat */}
        {post.is_bad_beat && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-yellow/30 relative shrink-0">
              <Image
                src="/img/logo.png"
                alt="Monkey Biz Poker Club Logo"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white/90">@Monkeybizpoker</div>
              <div className="text-[0.65rem] text-white/50 uppercase tracking-widest font-mono">Telegram submission</div>
            </div>
          </div>
        )}

        {/* 3. STYLIZED POKER TABLE REPLAY GRAPHIC (FROM JOSH'S MOCKUP) */}
        {post.is_bad_beat && hasLink && (
          <div className="rounded-lg border-2 border-yellow/40 bg-[#063c23] p-2.5 my-2.5 shadow-inner relative overflow-hidden flex flex-col items-center scale-95 sm:scale-100">
            {/* The felt ring */}
            <div className="w-full max-w-[210px] aspect-[2.1/1] rounded-full border-4 border-yellow/20 bg-[#072a1a] flex flex-col justify-center items-center p-1.5 relative">
              {post.handData ? (
                <>
                  {/* Dynamic Community Cards */}
                  <div className="flex gap-0.5 mb-0.5 scale-75 sm:scale-85">
                    {post.handData.board.map((card, idx) => (
                      <span key={idx}>{renderMiniCard(card)}</span>
                    ))}
                  </div>
                  
                  {post.handData.winner && (
                    <>
                      <span className="text-[0.43rem] font-bold text-yellow/80 uppercase tracking-wider font-mono text-center max-w-[130px] truncate leading-tight mt-0.5">
                        {post.handData.winner.name} WINS
                      </span>
                      <span className="text-[0.38rem] font-bold text-white/60 uppercase tracking-widest font-mono text-center">
                        ({post.handData.winner.pattern})
                      </span>

                      {/* Winner's Hand (top right) */}
                      <div className="absolute -top-1 -right-2 bg-[#8a0000] border border-yellow/30 rounded p-0.5 flex gap-0.5 scale-60">
                        {post.handData.winner.cards.map((card, idx) => (
                          <span key={idx}>{renderMiniCard(card, true)}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Loser's Hand (bottom left) */}
                  {post.handData.loser && (
                    <div className="absolute -bottom-1 -left-2 bg-[#0a1f3d] border border-yellow/30 rounded p-0.5 flex gap-0.5 scale-60">
                      {post.handData.loser.cards.map((card, idx) => (
                        <span key={idx}>{renderMiniCard(card, true)}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Static Mockup Fallback */}
                  <div className="flex gap-0.5 mb-0.5 scale-75 sm:scale-85">
                    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">A<span className="text-[0.5rem] text-red-600">♦</span></span>
                    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">K<span className="text-[0.5rem] text-red-600">♥</span></span>
                    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">10<span className="text-[0.5rem] text-red-600">♥</span></span>
                    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">9<span className="text-[0.5rem]">♠</span></span>
                    <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">Q<span className="text-[0.5rem]">♠</span></span>
                  </div>
                  <span className="text-[0.45rem] font-bold text-yellow/80 uppercase tracking-widest font-mono">VILLAIN WINS (Straight Flush)</span>

                  {/* Hero Hand (A A) */}
                  <div className="absolute -bottom-1 -left-2 bg-[#0a1f3d] border border-yellow/30 rounded p-0.5 flex gap-0.5 scale-60">
                    <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center">A<span className="text-[0.4rem]">♠</span></span>
                    <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center">A<span className="text-[0.4rem] text-red-600">♥</span></span>
                  </div>
                  {/* Villian Hand (10 J) */}
                  <div className="absolute -top-1 -right-2 bg-[#8a0000] border border-yellow/30 rounded p-0.5 flex gap-0.5 scale-60">
                    <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center">10<span className="text-[0.4rem]">♠</span></span>
                    <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center">J<span className="text-[0.4rem]">♠</span></span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <p
          className={`text-xl md:text-2xl leading-snug break-words ${FONT_CLASS[post.font_family]}`}
          style={{ color: post.is_bad_beat ? '#ffffff' : post.font_color }}
        >
          {renderMessageWithLinks(post.message, post.font_color, post.is_bad_beat)}
        </p>
      </div>

      <div className="mt-4">
        {/* 4. DRIPPING 5-TIER BANANA RATING ROW (FROM JOSH'S REQUEST) */}
        {post.is_bad_beat && (
          <div 
            className="flex justify-between items-center gap-1 border-t border-dashed pt-3 mb-3 animate-fade-in"
            style={{ borderColor: `rgba(255,209,59,0.2)` }}
          >
            {[1, 2, 3, 4, 5].map((tier) => {
              const count = (post as any)[`banana_${tier}`] || 0
              
              const tierNames = [
                "Slipped & Fell (The Peel)",
                "Mild Bruising (Double)",
                "Serious Pain (Trio Bunch)",
                "Table Flipped (Quad Cluster)",
                "Absolute Rigged (Monster Bunch)"
              ]
              
              return (
                <button
                  key={tier}
                  onClick={() => handleRate(tier)}
                  disabled={isPending}
                  className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-white/5 active:scale-95 disabled:opacity-50 transition-all duration-150 group/btn flex-1 cursor-pointer"
                  title={tierNames[tier - 1]}
                >
                  <div className="relative w-11 h-11 transition-transform group-hover/btn:scale-115">
                    <Image
                      src={`/img/banana-${tier}.png`}
                      alt={tierNames[tier - 1]}
                      fill
                      sizes="44px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span 
                    className="text-[0.7rem] font-bold opacity-80" 
                    style={{ color: '#ffd13b' }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Card Footer (Author & Date) */}
        {!post.is_bad_beat && (
          <div
            className="flex items-baseline justify-between gap-3 border-t border-dashed pt-2"
            style={{ borderColor: `${post.font_color}44` }}
          >
            <span
              className="font-[family-name:var(--font-hand)] text-lg"
              style={{ color: post.font_color }}
            >
              — {post.author}
            </span>
            <span
              className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-wider opacity-60"
              style={{ color: post.font_color }}
            >
              {timeAgo(post.created_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
