'use client'

import { useTransition, useState, useEffect } from 'react'
import Image from 'next/image'
import type { WallPost as WallPostType } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'
import { ratePost, addCommentToPost, splatPost, sufferPost, icePost } from '@/app/actions'

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

function isVotingActive(): boolean {
  try {
    const options = { timeZone: 'America/New_York' };
    const formatter = new Intl.DateTimeFormat('en-US', {
      ...options,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const weekday = parts.find(p => p.type === 'weekday')?.value;
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

    if (weekday === 'Sunday') {
      const totalMinutes = hour * 60 + minute;
      const startMinutes = 0 * 60 + 1; // 12:01 AM
      const endMinutes = 23 * 60 + 59; // 11:59 PM
      return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
    }
  } catch (e) {
    const localDate = new Date();
    const day = localDate.getDay(); // 0 is Sunday
    const hour = localDate.getHours();
    const minute = localDate.getMinutes();
    if (day === 0) {
      const totalMinutes = hour * 60 + minute;
      return totalMinutes >= 1 && totalMinutes <= 1439;
    }
  }
  return false;
}

function renderMiniCard(cardStr: string, isSmall = false) {
  if (!cardStr || cardStr.trim() === '' || cardStr.length < 2) {
    return renderCardBack(isSmall)
  }
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
      if (isBadBeat) {
        return <span key={i}>Thank You for entering our bad beat weekly contest</span>
      }
      let linkText = part
      if (part.includes('pokerbros.net')) {
        linkText = '[Watch Replay 🎥]'
      } else {
        try {
          const urlObj = new URL(part)
          linkText = `[Link: ${urlObj.hostname}]`
        } catch (e) {
          linkText = '[Link 🔗]'
        }
      }
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
          {linkText}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function getDynamicHeader(post: EnrichedWallPost): string {
  if (!post.is_bad_beat) return 'BAD BEAT!'

  // 1. If we have parsed PokerBros hand details, evaluate the bad beat mathematically!
  if (post.handData) {
    const board = post.handData.board || []
    const seats = post.handData.seats || []
    const winner = seats.find((s) => s.isWinner)
    const losers = seats.filter((s) => s.isLoser || (!s.isWinner && s.cards && s.cards.length > 0))

    // Check if the winner won with a ridiculous runner-runner or crazy hand pattern
    const pattern = winner?.pattern?.toLowerCase() || ''
    
    // Four of a Kind, Straight Flush, Royal Flush
    if (pattern.includes('four of a kind') || pattern.includes('straight flush') || pattern.includes('royal flush')) {
      return 'COOLER!'
    }

    // Full house cracking a flush or straight
    if (pattern.includes('full house') && losers.some(l => l.pattern?.toLowerCase().includes('flush') || l.pattern?.toLowerCase().includes('straight'))) {
      return 'HORSE 💩!'
    }

    // Trash hand winning (e.g. winner holds off-suit junk or low cards and hit a straight/flush)
    const winnerCards = winner?.cards || []
    if (winnerCards.length === 2) {
      const isOffsuitJunk = winnerCards[0].slice(0, -1) !== winnerCards[1].slice(0, -1) && 
                            parseInt(winnerCards[0].slice(0, -1)) < 10 && 
                            parseInt(winnerCards[1].slice(0, -1)) < 10
      if (isOffsuitJunk && (pattern.includes('straight') || pattern.includes('flush') || pattern.includes('two pair'))) {
        return 'MONKEY PUNT 🐒'
      }
    }

    // High pair (A A, K K) getting cracked by low trash cards
    const premiumLoser = losers.some(l => {
      const cards = l.cards || []
      return cards.length === 2 && (cards[0].startsWith('A') || cards[0].startsWith('K')) && (cards[1].startsWith('A') || cards[1].startsWith('K'))
    })
    if (premiumLoser) {
      return 'HORSE 💩!'
    }

    // Standard high flushes or straights getting cracked
    if (pattern.includes('flush') || pattern.includes('straight') || pattern.includes('full house')) {
      return 'SO SICK!'
    }
  }

  // 2. If we don't have replayer hand data (standard picture or video upload, or fallback mockup),
  // we use a stable, deterministic hash of the post ID to assign a hilarious, variety-rich header!
  const HEADERS = [
    'BAD BEAT!',
    'COOLER!',
    'SO SICK!',
    'HORSE 💩!',
    'MONKEY PUNT 🐒',
    'DIRTY RUNNER!',
    'COLD DECK!'
  ]
  
  let hash = 0
  const idStr = post.id || ''
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % HEADERS.length
  return HEADERS[index]
}

export default function WallPost({ post, index }: { post: EnrichedWallPost; index: number }) {
  const [isPending, startTransition] = useTransition()
  const [showComments, setShowComments] = useState(false)
  const [newCommentName, setNewCommentName] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)

  // Local storage vote limit helper (20 votes per day max!)
  const checkAndRegisterVote = (): boolean => {
    try {
      const key = 'mb_vote_timestamps'
      const raw = localStorage.getItem(key)
      const timestamps: number[] = raw ? JSON.parse(raw) : []
      const now = Date.now()
      const past24h = timestamps.filter(t => now - t < 24 * 60 * 60 * 1000)
      
      if (past24h.length >= 20) {
        alert("Vote limit reached! You can only cast 20 votes every 24 hours. Keep splatting tomorrow! 🍌")
        return false
      }
      
      past24h.push(now)
      localStorage.setItem(key, JSON.stringify(past24h))
      return true
    } catch (e) {
      console.error("Local storage error:", e)
      return true
    }
  }

  // Local storage banana vote limit helper (1 vote per 24 hours per submission!)
  const checkAndRegisterBananaVote = (postId: string): boolean => {
    try {
      const key = 'mb_banana_votes'
      const raw = localStorage.getItem(key)
      const votes: Record<string, number> = raw ? JSON.parse(raw) : {}
      const now = Date.now()
      const lastVote = votes[postId]
      
      if (lastVote && now - lastVote < 24 * 60 * 60 * 1000) {
        alert("You have already rated this bad beat submission! You can adjust your heat rating again in 24 hours. 🥵🔥")
        return false
      }
      
      votes[postId] = now
      localStorage.setItem(key, JSON.stringify(votes))
      return true
    } catch (e) {
      console.error("Local storage error:", e)
      return true
    }
  }

  // Parse source, suffer, splats, ice, and comments from message field
  const isWebsiteSubmission = post.message.includes('|||source|||website')
  const messageWithoutSource = post.message.replace('|||source|||website', '')

  // Parse suffer, splats, and ice from messageWithoutSource
  const iceParts = messageWithoutSource.split('|||ice|||')
  const baseWithSuffer = iceParts[0]
  const databaseIceCount = iceParts[1] ? parseInt(iceParts[1], 10) || 0 : 0

  const sufferParts = baseWithSuffer.split('|||suffer|||')
  const baseWithSplats = sufferParts[0]
  const databaseSufferCount = sufferParts[1] ? parseInt(sufferParts[1], 10) || 0 : 0

  // Parse splats from baseWithSplats
  const splatParts = baseWithSplats.split('|||splats|||')
  const baseMessageStr = splatParts[0]
  const databaseSplatCount = splatParts[1] ? parseInt(splatParts[1], 10) || 0 : 0

  // Parse comments from baseMessageStr
  const messageParts = baseMessageStr.split('|||comment|||')
  const mainMessage = messageParts[0]
  const comments = messageParts.slice(1).map((c) => {
    const idx = c.indexOf(': ')
    if (idx !== -1) {
      return { author: c.substring(0, idx), text: c.substring(idx + 2) }
    }
    return { author: 'Anon Monkey', text: c }
  })

  const [clientSplatCount, setClientSplatCount] = useState(databaseSplatCount)
  const [clientSufferCount, setClientSufferCount] = useState(databaseSufferCount)
  const [clientIceCount, setClientIceCount] = useState(databaseIceCount)
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0)

  // Clamp index to prevent any out-of-bounds rendering crashes
  const safeIndex = Math.min(currentCommentIndex, Math.max(0, comments.length - 1))
  const activeComment = comments[safeIndex]

  // Sync state with server prop updates
  useEffect(() => {
    setClientSplatCount(databaseSplatCount)
    setClientSufferCount(databaseSufferCount)
    setClientIceCount(databaseIceCount)
  }, [databaseSplatCount, databaseSufferCount, databaseIceCount])

  const handleSplat = () => {
    setClientSplatCount((prev) => prev + 1)
    startTransition(async () => {
      await splatPost(post.id)
    })
  }

  const handleSuffer = () => {
    setClientSufferCount((prev) => prev + 1)
    startTransition(async () => {
      await sufferPost(post.id)
    })
  }

  const handleIce = () => {
    setClientIceCount((prev) => prev + 1)
    startTransition(async () => {
      await icePost(post.id)
    })
  }

  const getSufferEmoji = (count: number) => {
    return '🤕'
  }

  const getSufferScale = (count: number) => {
    if (count === 0) return 1.0
    if (count === 1) return 1.2
    if (count === 2) return 1.4
    return Math.min(1.4 + Math.sqrt(count - 2) * 0.08, 1.8)
  }

  const handleNextComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentCommentIndex((prev) => (prev + 1) % comments.length)
  }

  const handlePrevComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentCommentIndex((prev) => (prev - 1 + comments.length) % comments.length)
  }

  // Determine if winner is a female player for custom placeholder
  const winnerSeat = post.handData?.seats.find((s) => s.isWinner)
  const isFemaleWinner = winnerSeat ? isFemalePlayer(winnerSeat.name) : false
  const commentPlaceholder = isFemaleWinner ? "Nice hand, ma'am! 🍌" : "Nice hand, sir! 🍌"

  const getHeatLabel = (score: number | null) => {
    if (score === null) return "Select a score above! 👇"
    if (score <= 2) return "Cold Deck ❄️"
    if (score <= 4) return "Lukewarm Beat"
    if (score <= 6) return "Ouch, Steaming! 🤕"
    if (score <= 8) return "Pure Highway Robbery! 🤬"
    return "HORSE 💩"
  }

  const [localHeat, setLocalHeat] = useState<number | null>(null)
  const [hasRatedHeat, setHasRatedHeat] = useState(false)

  useEffect(() => {
    try {
      const key = 'mb_banana_votes'
      const raw = localStorage.getItem(key)
      const votes: Record<string, number> = raw ? JSON.parse(raw) : {}
      const lastVote = votes[post.id]
      const now = Date.now()
      if (lastVote && (now - lastVote < 24 * 60 * 60 * 1000)) {
        setHasRatedHeat(true)
      } else {
        setHasRatedHeat(false)
      }
    } catch (e) {}
  }, [post.id])

  const handleDirectHeatSubmit = (num: number) => {
    if (!checkAndRegisterBananaVote(post.id)) return
    setLocalHeat(num)
    setHasRatedHeat(true)
    
    // Map local 1-10 to the 1-5 banana columns for storing votes
    const mappedTier = Math.min(5, Math.max(1, Math.ceil(num / 2)))
    
    startTransition(async () => {
      await ratePost(post.id, mappedTier)
    })
  }

  // Calculate dynamic stats
  const totalBananaVotes = (post.banana_1 || 0) + (post.banana_2 || 0) + (post.banana_3 || 0) + (post.banana_4 || 0) + (post.banana_5 || 0)
  const weightedSum = (post.banana_1 * 1) + (post.banana_2 * 2) + (post.banana_3 * 3) + (post.banana_4 * 4) + (post.banana_5 * 5)
  
  // Calculate average out of 10 points!
  const rawAvg = totalBananaVotes > 0 ? (weightedSum / totalBananaVotes) * 2 : 0
  const displayAverage = rawAvg.toFixed(1)

  const handleRate = (tier: number) => {
    if (!checkAndRegisterBananaVote(post.id)) return
    startTransition(async () => {
      await ratePost(post.id, tier)
    })
  }

  // Submit comment action
  const handleAddComment = () => {
    if (!checkAndRegisterVote()) return
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
        // Point to newly added comment index (next index is current length before state re-evaluation)
        setCurrentCommentIndex(comments.length) 
      } else {
        setCommentError(res.error || 'Failed to post comment.')
      }
    })
  }

  // Check if message contains a link
  const hasLink = mainMessage.includes('http://') || mainMessage.includes('https://')
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = mainMessage.match(urlRegex)
  const mediaUrl = matches ? matches[0] : null

  return (
    <div
      onClick={() => {
        if (!post.is_bad_beat && mediaUrl) {
          window.open(mediaUrl, '_blank')
        }
      }}
      className={`wall-card rise flex flex-col justify-between h-full relative overflow-visible transition-all duration-200 ${
        post.is_bad_beat 
          ? 'border-2 border-yellow shadow-[0_0_20px_rgba(255,209,59,0.35)] bg-[#0f0f0f] rounded-xl' 
          : 'cursor-pointer'
      }`}
      style={{
        background: post.is_bad_beat ? undefined : post.bg_color,
        transform: `rotate(${post.rotation}deg)`,
        animationDelay: `${Math.min(index * 0.06, 0.9)}s`,
      }}
    >
      {/* 1. DRIPPING "BAD BEAT!" HEADER PUDDLE (FROM JOSH'S MOCKUP) */}
      {post.is_bad_beat && (() => {
        const headerText = getDynamicHeader(post);
        const headerFontSize = headerText.length > 10 ? '6.0' : headerText.length > 8 ? '7.2' : '8.5';
        
        return (
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
              <text x="60" y="19" fill="#000000" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size={headerFontSize} text-anchor="middle" letter-spacing="0.2">{headerText}</text>
              <path d="M 80,10 C 76,8 70,11 68,13 C 70,12 73,10 80,10" stroke="#000000" stroke-width="1" fill="#ffd13b" />
            </svg>
          </div>
        );
      })()}

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
              <div className="text-[0.65rem] text-white/50 uppercase tracking-widest font-mono">
                {isWebsiteSubmission ? 'User entry' : 'Telegram submission'}
              </div>
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
              className="absolute top-[-22px] right-2 z-40 bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/40 rounded-full h-8 px-2 flex items-center justify-center gap-1 font-mono font-bold text-xs shadow-md transition-all duration-200 cursor-pointer"
              style={{
                transform: `scale(${Math.min(1 + Math.sqrt(clientSplatCount) * 0.06, 1.8)})`,
                transformOrigin: 'bottom right',
              }}
              title="Splat a Banana! 🫟"
            >
              <span>🫟</span>
              <span>{clientSplatCount}</span>
            </button>

            {/* Suffer Reaction Icon (🤕/🤢/🤮) at the Right End of Table (grows outwards) */}
            <button
              type="button"
              onClick={handleSuffer}
              className="absolute right-[-14px] top-[50%] -translate-y-1/2 z-40 bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/40 rounded-full h-8 px-2 flex items-center justify-center gap-1 font-mono font-bold text-xs shadow-md transition-all duration-200 cursor-pointer"
              style={{
                transform: `scale(${getSufferScale(clientSufferCount)})`,
                transformOrigin: 'center right',
              }}
              title="Ouch! React with Suffer 🤕"
            >
              <span>{getSufferEmoji(clientSufferCount)}</span>
              <span>{clientSufferCount}</span>
            </button>

            {/* Ice Reaction Icon (🧊) at the Bottom Left of Table (grows upwards) */}
            <button
              type="button"
              onClick={handleIce}
              className="absolute bottom-[-18px] left-2 z-40 bg-black/60 hover:bg-yellow hover:text-felt-deep text-yellow border border-yellow/40 rounded-full h-8 px-2 flex items-center justify-center gap-1 font-mono font-bold text-xs shadow-md transition-all duration-200 cursor-pointer"
              style={{
                transform: `scale(${Math.min(1.0 + Math.sqrt(clientIceCount) * 0.06, 1.8)})`,
                transformOrigin: 'bottom left',
              }}
              title="Ice! Keep it Cool 🧊"
            >
              <span>🧊</span>
              <span>{clientIceCount}</span>
            </button>

            {/* POKER TABLE FELT PREVIEW (ALWAYS VISIBLE!) - CLICK TO PLAY MEDIA */}
            <div 
              onClick={() => {
                if (mediaUrl) window.open(mediaUrl, '_blank')
              }}
              className="rounded-lg border-2 border-yellow/40 bg-[#063c23] px-3 py-5 w-full aspect-[2.2/1] shadow-inner relative overflow-visible flex flex-col items-center justify-center scale-95 sm:scale-100 cursor-pointer hover:border-yellow/70 active:scale-[0.99] transition-all duration-200 group/felt"
              title={mediaUrl ? "Click to play/view replay! 🎬" : undefined}
            >
              <div className="w-full h-full rounded-full border-4 border-yellow/20 bg-[#072a1a] relative overflow-visible">
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
                    {showComments ? (
                      /* Interactive Comments Slider inside Felt Center */
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-full max-w-[195px] px-1 select-none font-[family-name:var(--font-hand)]">
                        {comments.length > 0 ? (
                          <div className="flex items-center justify-between w-full gap-1">
                            {/* Left Arrow (only if comments.length > 1) */}
                            {comments.length > 1 ? (
                              <button
                                type="button"
                                onClick={handlePrevComment}
                                className="text-yellow hover:text-white font-black text-lg px-1.5 py-0.5 cursor-pointer active:scale-75 transition shrink-0"
                              >
                                ◀
                              </button>
                            ) : (
                              <div className="w-4 shrink-0" />
                            )}
                            
                            {/* Comment Text & Author inside a Cartoonish White Speech Bubble 🗯️ */}
                            <div 
                              className="flex-1 flex flex-col items-center justify-center text-center bg-white text-felt-deep rounded-xl shadow-md border border-yellow/30 p-2 relative transition-all duration-300 min-h-[46px]"
                              style={{
                                transform: `scale(${Math.min(1.0 + (activeComment?.text?.length || 0) * 0.0015, 1.15)})`,
                              }}
                            >
                              {/* Comic Speech Bubble Triangle Tail */}
                              <div className="absolute top-[99%] left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-white z-10" />

                              <p className="text-[0.54rem] sm:text-[0.58rem] font-[family-name:var(--font-mono)] leading-snug break-words max-h-[38px] overflow-y-auto w-full pr-0.5 text-felt-deep">
                                &ldquo;{activeComment?.text}&rdquo;
                              </p>
                              <span className="text-[0.38rem] font-bold font-mono text-red/85 tracking-wider uppercase mt-1 leading-none block truncate max-w-[80px]">
                                — {activeComment?.author}
                              </span>
                            </div>

                            {/* Right Arrow (only if comments.length > 1) */}
                            {comments.length > 1 ? (
                              <button
                                type="button"
                                onClick={handleNextComment}
                                className="text-yellow hover:text-white font-black text-lg px-1.5 py-0.5 cursor-pointer active:scale-75 transition shrink-0"
                              >
                                ▶
                              </button>
                            ) : (
                              <div className="w-4 shrink-0" />
                            )}
                          </div>
                        ) : (
                          <p className="text-[0.52rem] text-cream/40 italic font-mono text-center">
                            No comments yet. Leave one below!
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-full max-w-[195px]">
                        {/* Dynamic Community Cards */}
                        <div className="flex gap-0.5 mb-1 scale-90 sm:scale-100">
                          {post.handData.board.map((card, idx) => (
                            <span key={idx}>{renderMiniCard(card)}</span>
                          ))}
                        </div>
                        
                        {/* Text Details in Center */}
                        {post.handData.seats.find(s => s.isWinner) && (
                          <div className="flex flex-col items-center select-none bg-felt-deep/80 px-2 py-0.5 rounded border border-yellow/10">
                            <span className="text-[0.43rem] font-bold text-yellow uppercase tracking-wider font-mono text-center">
                              🏆 {post.handData.seats.find(s => s.isWinner)?.name} WINS
                            </span>
                            <span className="text-[0.35rem] font-semibold text-white/60 uppercase tracking-widest font-mono text-center leading-none mt-0.5">
                              ({post.handData.seats.find(s => s.isWinner)?.pattern})
                            </span>
                          </div>
                        )}
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
                    {showComments ? (
                      /* Interactive Comments Slider inside Felt Center (Static Fallback Card) */
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-full max-w-[195px] px-1 select-none font-[family-name:var(--font-hand)]">
                        {comments.length > 0 ? (
                          <div className="flex items-center justify-between w-full gap-1">
                            {/* Left Arrow (only if comments.length > 1) */}
                            {comments.length > 1 ? (
                              <button
                                type="button"
                                onClick={handlePrevComment}
                                className="text-yellow hover:text-white font-black text-lg px-1.5 py-0.5 cursor-pointer active:scale-75 transition shrink-0"
                              >
                                ◀
                              </button>
                            ) : (
                              <div className="w-4 shrink-0" />
                            )}
                            
                            {/* Comment Text & Author inside a Cartoonish White Speech Bubble 🗯️ */}
                            <div 
                              className="flex-1 flex flex-col items-center justify-center text-center bg-white text-felt-deep rounded-xl shadow-md border border-yellow/30 p-2 relative transition-all duration-300 min-h-[46px]"
                              style={{
                                transform: `scale(${Math.min(1.0 + (activeComment?.text?.length || 0) * 0.0015, 1.15)})`,
                              }}
                            >
                              {/* Comic Speech Bubble Triangle Tail */}
                              <div className="absolute top-[99%] left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-white z-10" />

                              <p className="text-[0.54rem] sm:text-[0.58rem] font-[family-name:var(--font-mono)] leading-snug break-words max-h-[38px] overflow-y-auto w-full pr-0.5 text-felt-deep">
                                &ldquo;{activeComment?.text}&rdquo;
                              </p>
                              <span className="text-[0.38rem] font-bold font-mono text-red/85 tracking-wider uppercase mt-1 leading-none block truncate max-w-[80px]">
                                — {activeComment?.author}
                              </span>
                            </div>

                            {/* Right Arrow (only if comments.length > 1) */}
                            {comments.length > 1 ? (
                              <button
                                type="button"
                                onClick={handleNextComment}
                                className="text-yellow hover:text-white font-black text-lg px-1.5 py-0.5 cursor-pointer active:scale-75 transition shrink-0"
                              >
                                ▶
                              </button>
                            ) : (
                              <div className="w-4 shrink-0" />
                            )}
                          </div>
                        ) : (
                          <p className="text-[0.52rem] text-cream/40 italic font-mono text-center">
                            No comments yet. Leave one below!
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-full max-w-[195px]">
                        {/* Static Mockup Fallback */}
                        <div className="flex gap-0.5 mb-0.5 scale-75 sm:scale-85">
                          <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">A<span className="text-[0.5rem] text-red-600">♦</span></span>
                          <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">K<span className="text-[0.5rem] text-red-600">♥</span></span>
                          <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">10<span className="text-[0.5rem] text-red-600">♥</span></span>
                          <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">9<span className="text-[0.5rem]">♠</span></span>
                          <span className="w-5 h-7 rounded bg-white text-black font-bold text-[0.6rem] flex flex-col items-center justify-center shadow">Q<span className="text-[0.5rem]">♠</span></span>
                        </div>
                        <span className="text-[0.45rem] font-bold text-yellow/80 uppercase tracking-widest font-mono text-center">VILLAIN WINS (Straight Flush)</span>

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
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* COLLAPSIBLE QUICK REPLY FORM BELOW THE TABLE */}
            {showComments && (
              <div className="mt-3 bg-black/45 rounded-lg border border-yellow/10 p-2.5 w-full max-w-[270px] flex flex-col gap-1 animate-fade-in relative z-30 shadow-lg">
                <div className="flex gap-1.5 items-center">
                  {/* Name Input */}
                  <input
                    type="text"
                    placeholder="monkey"
                    maxLength={15}
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    className="w-[28%] text-base md:text-xs font-mono bg-black/85 border border-yellow/20 rounded p-2 text-white outline-none focus:border-yellow transition shrink-0"
                  />
                  {/* Message Input */}
                  <input
                    type="text"
                    placeholder={commentPlaceholder}
                    maxLength={100}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 text-base md:text-xs bg-black/85 border border-yellow/20 rounded p-2 text-white outline-none focus:border-yellow transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={isPending || !newCommentText.trim()}
                    className="bg-yellow hover:bg-yellow-bright text-felt-deep font-black font-mono text-[0.55rem] uppercase px-3 py-1.5 rounded transition cursor-pointer disabled:opacity-40 shrink-0 shadow-sm"
                  >
                    {isPending ? '..' : 'POST'}
                  </button>
                </div>
                {commentError && (
                  <span className="text-[0.55rem] text-red-500 font-bold truncate">
                    {commentError}
                  </span>
                )}
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
        {/* 4. DRIPPING RED HOT HEAT METER BUTTON ROW (1-10) */}
        {post.is_bad_beat && isVotingActive() && (
          <div 
            className="border-t border-dashed pt-4 mb-3 animate-fade-in text-center select-none"
            style={{ borderColor: `rgba(255,209,59,0.25)` }}
          >
            {/* Tap controls or confirmation message */}
            {!hasRatedHeat ? (
              <div className="space-y-3 px-1 mt-3">
                <div className="flex flex-wrap justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleDirectHeatSubmit(num)}
                      disabled={isPending}
                      className="w-7 h-7 rounded-full font-black font-mono text-xs flex items-center justify-center transition-all cursor-pointer relative z-50 shadow-sm border bg-black/40 hover:bg-yellow hover:text-felt-deep text-white/70 border-white/10 active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <span className="text-[0.65rem] font-black tracking-widest text-yellow uppercase animate-pulse">
                    👈 Tap any number to vote instantly!
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 mt-2 text-center">
                <p className="text-[0.7rem] font-bold text-yellow uppercase tracking-wider leading-none">
                  🔥 Rating Submitted! 
                </p>
                <p className="text-[0.6rem] text-white/50 font-mono mt-1 mb-2">
                  Adjustments unlock in 24 hours. Good luck at the tables!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const key = 'mb_banana_votes'
                      const raw = localStorage.getItem(key)
                      const votes = raw ? JSON.parse(raw) : {}
                      delete votes[post.id]
                      localStorage.setItem(key, JSON.stringify(votes))
                      setHasRatedHeat(false)
                    } catch(e) {}
                  }}
                  className="px-2 py-1 bg-red/20 hover:bg-red/40 border border-red/30 rounded text-[0.55rem] font-mono font-bold text-red-400 uppercase tracking-widest transition"
                >
                  ⚡ DEV: Clear Vote Lock
                </button>
              </div>
            )}
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
