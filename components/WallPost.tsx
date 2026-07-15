'use client'

import { useState, useTransition } from 'react'
import { ratePost } from '@/app/actions'
import type { WallPost as WallPostType } from '@/lib/supabase'
import Image from 'next/image'

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

export default function WallPost({ post, index }: { post: WallPostType; index: number }) {
  const [isPending, startTransition] = useTransition()
  
  // Local state for optimistic upvotes
  const [votes, setVotes] = useState({
    1: post.banana_1 || 0,
    2: post.banana_2 || 0,
    3: post.banana_3 || 0,
    4: post.banana_4 || 0,
    5: post.banana_5 || 0,
  })

  // Prevent multiple upvotes per post session
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({})

  const handleVote = (tier: number) => {
    if (hasVoted[tier]) return
    
    // Optimistic update
    setVotes(prev => ({ ...prev, [tier]: prev[tier as 1|2|3|4|5] + 1 }))
    setHasVoted(prev => ({ ...prev, [tier]: true }))

    startTransition(async () => {
      await ratePost(post.id, tier)
    })
  }

  const bananaTiers = [
    { tier: 1, img: '/img/banana-1.png', label: 'Peel' },
    { tier: 2, img: '/img/banana-2.png', label: 'Double' },
    { tier: 3, img: '/img/banana-3.png', label: 'Trio' },
    { tier: 4, img: '/img/banana-4.png', label: 'Quad' },
    { tier: 5, img: '/img/banana-5.png', label: 'Monster' },
  ]

  return (
    <div
      className="wall-card rise flex flex-col justify-between"
      style={{
        background: post.bg_color,
        transform: `rotate(${post.rotation}deg)`,
        animationDelay: `${Math.min(index * 0.06, 0.9)}s`,
      }}
    >
      <div>
        <p
          className={`text-xl md:text-2xl leading-snug break-words ${FONT_CLASS[post.font_family]}`}
          style={{ color: post.font_color }}
        >
          {post.message}
        </p>
      </div>

      <div className="mt-4">
        {/* The Banana Splat Rating Row */}
        <div 
          className="flex justify-between items-center gap-1 border-t border-dashed pt-3 mb-2"
          style={{ borderColor: `${post.font_color}25` }}
        >
          {bananaTiers.map(t => {
            const count = votes[t.tier as 1|2|3|4|5]
            const voted = hasVoted[t.tier]
            return (
              <button
                key={t.tier}
                onClick={() => handleVote(t.tier)}
                className={`flex flex-col items-center flex-1 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  voted 
                    ? 'scale-110 opacity-100 bg-white/10' 
                    : 'hover:scale-115 hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
                title={`Rate this bad beat: ${t.label}`}
              >
                <div className="relative w-11 h-11 transition-transform active:scale-95 duration-100">
                  <Image
                    src={t.img}
                    alt={t.label}
                    fill
                    sizes="44px"
                    className="object-contain"
                  />
                </div>
                <span 
                  className="text-xs font-bold font-mono mt-1"
                  style={{ color: post.font_color }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

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
      </div>
    </div>
  )
}
