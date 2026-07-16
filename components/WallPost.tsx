'use client'

import { useTransition, useState, useEffect } from 'react'
import Image from 'next/image'
import type { WallPost as WallPostType } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'
import { ratePost, addCommentToPost, splatPost } from '@/app/actions'

const SEAT_POSITIONS: Record<number, string> = {
  0: 'bottom-[-10%] left-[50%] -translate-x-1/2',
  1: 'bottom-[12%] left-[4%]',
  2: 'top-[36%] left-[-9%]',
  3: 'top-[12%] left-[4%]',
  4: 'top-[-10%] left-[32%] -translate-x-1/2',
  5: 'top-[-10%] left-[68%] -translate-x-1/2',
  6: 'top-[12%] right-[4%]',
  7: 'top-[36%] right-[-9%]',
  8: 'bottom-[12%] right-[4%]'
}

const FEMALE_PLAYERS = [
  'nitty',
  'avymae',
  'vudoo13',
  '2pretty2call',
  'chickdee',
  'dragonqueen',
  'mamasophat',
  'queen1212',
  'mermaidme',
  'leelee1712',
  'trump fan',
  'joebizzle',
  'annieoak'
]

function isFemalePlayer(name: string): boolean {
  if (!name) return false
  const clean = name
    .toLowerCase()
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
    .trim()
  
  return FEMALE_PLAYERS.some(f => clean.includes(f) || f.includes(clean))
}

function renderMiniCard(cardStr: string, isSmall = false) {
  // e.g. "10♥" or "A♠"
  const value = cardStr.slice(0, -1)
  const suit = cardStr.slice(-1)
  const isRed = suit === '♥' || suit === '♦'
  
  if (isSmall) {
    return (
      <span className="w-3.5 h-5 rounded bg-white text-black font-bold text-[0.5rem] flex flex-col items-center justify-center shadow select-none leading-none">
        {value}
        <span className={`text-[0.4rem] leading-none ${isRed ? 'text-red-600' : ''}`}>{suit}</span>
      </span>
    )
  }
  
  return (
    <span className="w-5.5 h-7.5 rounded bg-white text-black font-bold text-[0.7rem] flex flex-col items-center justify-center shadow select-none leading-none">
      {value}
      <span className={`text-[0.5rem] leading-none ${isRed ? 'text-red-600' : ''}`}>{suit}</span>
    </span>
  )
}

function renderCardBack(isSmall = false) {
  if (isSmall) {
    return (
      <span className="w-3.5 h-5 rounded bg-[#1c2e4c] border border-white/10 shadow-sm select-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] border border-dashed border-white/10 rounded-[1px] flex items-center justify-center bg-[#152340]">
          <span className="text-[0.35rem] font-bold text-white/30 leading-none">♣</span>
        </div>
      </span>
    )
  }
  return (
    <span className="w-5.5 h-7.5 rounded bg-[#1c2e4c] border border-white/10 shadow-sm select-none flex items-center justify-center">
      <div className="w-[85%] h-[85%] border border-dashed border-white/10 rounded-[1px] flex items-center justify-center bg-[#152340]">
        <span className="text-[0.45rem] font-bold text-white/30 leading-none">♣</span>
      </div>
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
  const [showComments, setShowComments] = useState(false)
  const [newCommentName, setNewCommentName] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [clientSplatCount, setClientSplatCount] = useState(post.banana_count || 0)

  // Sync clientSplatCount with server prop updates
  useEffect(() => {
    setClientSplatCount(post.banana_count || 0)
  }, [post.banana_count])

  const handleSplat = () => {
    setClientSplatCount((prev) => prev + 1)
    startTransition(async () => {
      await splatPost(post.id)
    })
  }

  // Determine if winner is a female player for custom placeholder
  const winnerSeat = post.handData?.seats.find((s) => s.isWinner)
  const isFemaleWinner = winnerSeat ? isFemalePlayer(winnerSeat.name) : false
  const commentPlaceholder = isFemaleWinner ? "Nice hand, ma'am! 🍌" : "Nice hand, sir! 🍌"

  const handleRate = (tier: number) => {
    startTransition(async () => {
      await ratePost(post.id, tier)
    })
  }

  // Parse comments from message field
  const messageParts = post.message.split('|||comment|||')
  const mainMessage = messageParts[0]
  const comments = messageParts.slice(1).map((c) => {
    const idx = c.indexOf(': ')
    if (idx !== -1) {
      return { author: c.substring(0, idx), text: c.substring(idx + 2) }
    }
    return { author: 'Anon Monkey', text: c }
  })

  // Submit comment action
  const handleAddComment = () => {
    setCommentError(null)
    startTransition(async () => {
      const name = newCommentName.trim() || 'Anon Monkey'
      const text = newCommentText.trim()
      if (!text) {
        setCommentError('Comment cannot be empty!')
        return
      }

      const res = await addCommentToPost(post.id, name, text)
      if (res.ok) {
        setNewCommentName('')
        setNewCommentText('')
      } else {
        setCommentError(res.error || 'Failed to post comment.')
      }
    })
  }

  // Check if message contains a link
  const hasLink = mainMessage.includes('http://') || mainMessage.includes('https://')

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

        {/* 3. POKER TABLE AREA AND COLLAPSIBLE INLINE COMMENTS */}
        {post.is_bad_beat && hasLink && (
          <div className="relative w-full max-w-[270px] my-4 overflow-visible">
            {/* Message Icon (💬) at the Top Left of Table */}
            <button
              type="button"
              onClick={() => {
                setCommentError(null)
                setShowComments((prev) => !prev)
              }}
              className={`absolute top-[-22px] left-2 z-40 rounded-full w-8 h-8 flex items-center justify-center text-xs shadow-md transition-all duration-200 border cursor-pointer ${
                showComments
                  ? 'bg-yellow text-felt-deep border-white scale-110 shadow-[0_0_8px_rgba(255,209,59,0.5)]'
                  : 'bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border-yellow/40 hover:scale-105'
              }`}
              title="View or Add Comments"
            >
              💬
            </button>

            {/* Splat Icon (🫟) at the Top Right of Table (grows upwards and leftwards) */}
            <button
              type="button"
              onClick={handleSplat}
              className="absolute top-[-22px] right-2 z-40 bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/40 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md transition-all duration-200 cursor-pointer"
              style={{
                transform: `scale(${Math.min(1 + Math.sqrt(clientSplatCount) * 0.06, 1.8)})`,
                transformOrigin: 'bottom right',
              }}
              title="Splat a Banana! 🫟"
            >
              🫟
            </button>

            {/* POKER TABLE FELT PREVIEW (ALWAYS VISIBLE!) */}
            <div className="rounded-lg border-2 border-yellow/40 bg-[#063c23] px-3 py-5 w-full aspect-[2.2/1] shadow-inner relative overflow-visible flex flex-col items-center justify-center scale-95 sm:scale-100">
              <div className="w-full h-full rounded-full border-4 border-yellow/20 bg-[#072a1a] flex flex-col justify-center items-center p-1.5 relative overflow-visible">
                {/* Growing Banana Splat Overlay */}
                {clientSplatCount > 0 && (
                  <div 
                    className="absolute bottom-[5%] right-[12%] w-16 h-16 pointer-events-none select-none z-10 transition-transform duration-200 ease-out"
                    style={{
                      transform: `scale(${Math.min(0.3 + Math.sqrt(clientSplatCount) * 0.08, 1.5)})`,
                      transformOrigin: 'bottom right',
                    }}
                  >
                    <Image
                      src="/img/banana-splat.png"
                      alt="Splat!"
                      fill
                      sizes="64px"
                      className="object-contain opacity-80"
                    />
                  </div>
                )}
                {post.handData ? (
                  <>
                    {/* Dynamic Community Cards */}
                    <div className="flex gap-0.5 mb-1 scale-90 sm:scale-100 relative z-20">
                      {post.handData.board.map((card, idx) => (
                        <span key={idx}>{renderMiniCard(card)}</span>
                      ))}
                    </div>
                    
                    {/* Text Details in Center */}
                    {post.handData.seats.find(s => s.isWinner) && (
                      <div className="flex flex-col items-center select-none relative z-20 bg-felt-deep/80 px-2 py-0.5 rounded border border-yellow/10">
                        <span className="text-[0.43rem] font-bold text-yellow uppercase tracking-wider font-mono text-center">
                          🏆 {post.handData.seats.find(s => s.isWinner)?.name} WINS
                        </span>
                        <span className="text-[0.35rem] font-semibold text-white/60 uppercase tracking-widest font-mono text-center leading-none mt-0.5">
                          ({post.handData.seats.find(s => s.isWinner)?.pattern})
                        </span>
                      </div>
                    )}

                    {/* 9 Seats Layout */}
                    {post.handData.seats.map((s) => {
                      const posClass = SEAT_POSITIONS[s.seat] || 'hidden'
                      const displayName = s.name.length > 5 ? s.name.substring(0, 5) + '..' : s.name
                      
                      return (
                        <div
                          key={s.seat}
                          className={`absolute flex flex-col items-center z-10 transition-all ${posClass} ${
                            s.folded ? 'opacity-70' : 'opacity-100'
                          }`}
                        >
                          {/* Player Pocket Cards */}
                          {s.folded ? (
                            <div className="flex gap-0.5 mb-0.5 scale-[0.6] origin-bottom -my-1 shadow-sm relative z-30 opacity-40">
                              {renderCardBack(true)}
                              {renderCardBack(true)}
                            </div>
                          ) : (
                            s.cards && s.cards.length > 0 && (
                              <div className="flex items-center gap-0.5 mb-0.5 scale-[0.6] origin-bottom -my-1 shadow-md relative z-30">
                                {s.isWinner && (
                                  <span className="text-[1.2rem] font-black text-[#ffd13b] animate-winning-W mr-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none">
                                    W
                                  </span>
                                )}
                                {s.cards.map((c, idx) => (
                                  <span key={idx}>{renderMiniCard(c, true)}</span>
                                ))}
                              </div>
                            )
                          )}

                          {/* Player Name Pill */}
                          <div
                            className={`px-1.5 py-0.5 rounded-full border text-[0.45rem] font-bold font-mono tracking-wide leading-none shadow-sm flex items-center gap-0.5 max-w-[62px] truncate ${
                              s.isWinner
                                ? 'bg-yellow text-felt-deep border-white shadow-[0_0_8px_rgba(255,209,59,0.5)] z-20'
                                : s.isLoser
                                ? 'bg-[#0a1f3d] text-white border-yellow/30 z-20'
                                : s.folded
                                ? 'bg-[#1a1a0f]/90 text-white/65 border-white/15'
                                : 'bg-felt-deep text-white border-yellow/20'
                            }`}
                          >
                            {displayName}
                          </div>
                        </div>
                      )
                    })}
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

            {/* COLLAPSIBLE COMMENTS SECTION BELOW THE TABLE */}
            {showComments && (
              <div className="mt-3 bg-black/40 rounded-lg border border-yellow/10 p-2.5 w-full max-w-[270px] flex flex-col justify-between shadow-xl animate-fade-in relative z-30">
                {/* Comments Header */}
                <div className="flex justify-between items-center text-[0.6rem] font-bold font-mono tracking-widest text-yellow/80 uppercase border-b border-white/10 pb-1.5 mb-2">
                  <span>Comments ({comments.length})</span>
                </div>

                {/* Scrollable Comments Feed */}
                {comments.length > 0 ? (
                  <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 font-[family-name:var(--font-hand)] mb-2">
                    {comments.map((c, idx) => (
                      <div key={idx} className="text-xs text-white leading-tight bg-white/5 p-1.5 rounded border border-white/5">
                        <span className="font-mono font-bold text-[0.6rem] text-yellow/90 block leading-none mb-0.5">
                          {c.author}
                        </span>
                        <span className="break-words font-[family-name:var(--font-hand)]">{c.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.65rem] text-cream/40 italic text-center py-2 mb-2 font-mono">No comments yet. Be the first!</p>
                )}

                {/* Quick-Reply Form Inline at Bottom */}
                <div className="border-t border-white/10 pt-2 flex flex-col gap-1">
                  <div className="flex gap-1">
                    {/* Name Input */}
                    <input
                      type="text"
                      placeholder="monkey"
                      maxLength={15}
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      className="w-16 text-[0.6rem] font-mono bg-black/80 border border-yellow/20 rounded p-1 text-white outline-none focus:border-yellow transition shrink-0"
                    />
                    {/* Message Input */}
                    <input
                      type="text"
                      placeholder={commentPlaceholder}
                      maxLength={100}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 text-[0.6rem] bg-black/80 border border-yellow/20 rounded p-1 text-white outline-none focus:border-yellow transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={isPending || !newCommentText.trim()}
                      className="bg-yellow hover:bg-yellow-bright text-felt-deep font-bold font-mono text-[0.55rem] uppercase px-2.5 rounded transition cursor-pointer disabled:opacity-40 shrink-0"
                    >
                      {isPending ? '..' : 'SPLAT'}
                    </button>
                  </div>
                  {commentError && (
                    <span className="text-[0.55rem] text-red-500 font-bold truncate">
                      {commentError}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <p
          className={`text-xl md:text-2xl leading-snug break-words ${FONT_CLASS[post.font_family]}`}
          style={{ color: post.is_bad_beat ? '#ffffff' : post.font_color }}
        >
          {renderMessageWithLinks(mainMessage, post.font_color, post.is_bad_beat)}
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
