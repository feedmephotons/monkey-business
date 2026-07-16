'use client'

import { useTransition, useState, useEffect } from 'react'
import Image from 'next/image'
import type { WallPost as WallPostType } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'
import { ratePost, addCommentToPost } from '@/app/actions'

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
  const [viewMode, setViewMode] = useState<'table' | 'comments' | 'add_comment'>('table')
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0)
  const [newCommentName, setNewCommentName] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)

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

  // Revert to table on scroll
  useEffect(() => {
    if (viewMode !== 'table') {
      const handleScroll = () => {
        setViewMode('table')
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [viewMode])

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
        setViewMode('comments')
        setCurrentCommentIndex(comments.length) // point to newly added comment
      } else {
        setCommentError(res.error || 'Failed to post comment.')
      }
    })
  }

  // Next comment navigation
  const handleNextComment = () => {
    if (currentCommentIndex === comments.length - 1) {
      // Once you go through all commits, revert to the table
      setViewMode('table')
      setCurrentCommentIndex(0)
    } else {
      setCurrentCommentIndex((prev) => prev + 1)
    }
  }

  // Prev comment navigation
  const handlePrevComment = () => {
    if (currentCommentIndex === 0) {
      setViewMode('table')
    } else {
      setCurrentCommentIndex((prev) => prev - 1)
    }
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

        {/* 3. POKER TABLE AREA OR COMMENT AREA */}
        {post.is_bad_beat && hasLink && (
          <div className="relative w-full max-w-[270px] aspect-[2.2/1] my-4 overflow-visible">
            {/* Message Icon (💬) at the Top Center-Right of Table */}
            <button
              type="button"
              onClick={() => {
                setCommentError(null)
                if (viewMode === 'table') {
                  setViewMode(comments.length > 0 ? 'comments' : 'add_comment')
                  setCurrentCommentIndex(0)
                } else {
                  setViewMode('table')
                }
              }}
              className={`absolute top-[-18px] right-2 z-40 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md transition-all duration-200 border cursor-pointer ${
                viewMode !== 'table'
                  ? 'bg-yellow text-felt-deep border-white scale-110'
                  : 'bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border-yellow/40 hover:scale-105'
              }`}
              title="View or Add Comments"
            >
              💬
            </button>

            {viewMode === 'table' ? (
              /* POKER TABLE FELT PREVIEW */
              <div className="rounded-lg border-2 border-yellow/40 bg-[#063c23] px-3 py-5 w-full h-full shadow-inner relative overflow-visible flex flex-col items-center justify-center scale-95 sm:scale-100">
                <div className="w-full max-w-[270px] aspect-[2.2/1] rounded-full border-4 border-yellow/20 bg-[#072a1a] flex flex-col justify-center items-center p-1.5 relative overflow-visible">
                  {post.handData ? (
                    <>
                      {/* Dynamic Community Cards (centered, slightly larger) */}
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
                              /* Facedown folded cards back (makes folded hands noticeable!) */
                              <div className="flex gap-0.5 mb-0.5 scale-[0.6] origin-bottom -my-1 shadow-sm relative z-30 opacity-40">
                                {renderCardBack(true)}
                                {renderCardBack(true)}
                              </div>
                            ) : (
                              /* Face-up active cards */
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
            ) : viewMode === 'comments' ? (
              /* VIEWING VIEWER COMMENTS (COMMITS) */
              <div className="rounded-lg border-2 border-yellow/40 bg-[#121212] px-4 py-3 w-full h-full flex flex-col justify-between scale-95 sm:scale-100 shadow-xl overflow-hidden relative">
                {/* Comments Header */}
                <div className="flex justify-between items-center text-[0.6rem] font-bold font-mono tracking-widest text-yellow/80 uppercase border-b border-white/10 pb-1.5">
                  <span>Comments ({comments.length})</span>
                  <span>{currentCommentIndex + 1} of {comments.length}</span>
                </div>

                {/* Comment Content (Centered vertically) */}
                <div className="flex-1 flex flex-col justify-center py-2 px-6">
                  <p className="text-white font-[family-name:var(--font-hand)] text-lg leading-snug text-center break-words max-h-[64px] overflow-y-auto">
                    &ldquo;{comments[currentCommentIndex].text}&rdquo;
                  </p>
                  <p className="text-[0.65rem] font-black text-yellow/70 tracking-wider font-mono text-center mt-1.5">
                    — {comments[currentCommentIndex].author}
                  </p>
                </div>

                {/* Comments Controls */}
                <div className="flex justify-between items-center border-t border-white/10 pt-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('add_comment')}
                    className="text-[0.6rem] font-bold text-yellow/80 hover:text-white uppercase tracking-wider font-mono bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition cursor-pointer"
                  >
                    + Add Comment
                  </button>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrevComment}
                      className="bg-felt-deep hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/20 rounded px-2.5 py-0.5 font-bold transition cursor-pointer"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={handleNextComment}
                      className="bg-felt-deep hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/20 rounded px-2.5 py-0.5 font-bold transition cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ADD NEW COMMENT FORM */
              <div className="rounded-lg border-2 border-yellow/40 bg-[#121212] px-4 py-3 w-full h-full flex flex-col justify-between scale-95 sm:scale-100 shadow-xl overflow-hidden relative">
                {/* Form Header */}
                <div className="flex justify-between items-center text-[0.6rem] font-bold font-mono tracking-widest text-yellow/80 uppercase border-b border-white/10 pb-1.5">
                  <span>Add Comment</span>
                  <button
                    type="button"
                    onClick={() => setViewMode(comments.length > 0 ? 'comments' : 'table')}
                    className="text-[0.55rem] text-cream/50 hover:text-cream cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Form Inputs */}
                <div className="flex-1 flex gap-2 items-center py-2.5">
                  {/* Name Input */}
                  <input
                    type="text"
                    placeholder="monkey"
                    maxLength={15}
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    className="w-[32%] text-[0.65rem] font-mono bg-black border border-yellow/20 rounded p-1.5 text-white outline-none focus:border-yellow transition"
                  />
                  {/* Message Input */}
                  <input
                    type="text"
                    placeholder="Nice hand, sir! 🍌"
                    maxLength={100}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 text-[0.65rem] bg-black border border-yellow/20 rounded p-1.5 text-white outline-none focus:border-yellow transition"
                  />
                </div>

                {/* Form Footer */}
                <div className="flex justify-between items-center border-t border-white/10 pt-1.5">
                  <span className="text-[0.55rem] text-red-500 font-bold truncate max-w-[150px]">
                    {commentError || ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={isPending || !newCommentText.trim()}
                    className="bg-yellow hover:bg-yellow-bright text-felt-deep font-bold font-mono text-[0.6rem] tracking-wider uppercase px-4 py-1.5 rounded transition cursor-pointer disabled:opacity-40"
                  >
                    {isPending ? 'POSTING..' : 'POST'}
                  </button>
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
