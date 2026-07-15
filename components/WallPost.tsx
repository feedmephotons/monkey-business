"use client";

import { useTransition } from 'react'
import Image from 'next/image'
import type { WallPost as WallPostType } from '@/lib/supabase'
import { ratePost } from '@/app/actions'

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

  const handleRate = (tier: number) => {
    startTransition(async () => {
      await ratePost(post.id, tier)
    })
  }

  return (
    <div
      className={`wall-card rise flex flex-col justify-between h-full`}
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
        {/* Interactive 5-Tier Banana Rating Panel (Only for Bad Beats) */}
        {post.is_bad_beat && (
          <div 
            className="flex justify-between items-center gap-1 border-t border-dashed pt-2 mb-3"
            style={{ borderColor: `${post.font_color}33` }}
          >
            {[1, 2, 3, 4, 5].map((tier) => {
              const count = (post as any)[`banana_${tier}`] || 0
              
              // Text representation for accessibility/title
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
                  className="flex flex-col items-center gap-1 p-1 rounded hover:bg-black/10 active:scale-95 disabled:opacity-50 transition-all duration-150 group/btn"
                  title={tierNames[tier - 1]}
                >
                  <Image
                    src={`/img/banana-${tier}.png`}
                    alt={tierNames[tier - 1]}
                    width={40}
                    height={40}
                    className="w-8 h-8 object-contain transition-transform duration-200 group-hover/btn:scale-115 group-active/btn:scale-90"
                    priority
                  />
                  <span 
                    className="text-[0.7rem] font-bold opacity-80" 
                    style={{ color: post.font_color }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Footer (Author & Time) */}
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
