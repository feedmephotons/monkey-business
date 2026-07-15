'use client'

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

  const handleRate = () => {
    startTransition(async () => {
      await ratePost(post.id, 1)
    })
  }

  return (
    <div
      className={`wall-card rise flex flex-col justify-between h-full relative overflow-visible ${
        post.is_bad_beat 
          ? 'border-2 border-yellow/60 shadow-[0_0_15px_rgba(255,209,59,0.2)] bg-[#042112]' 
          : ''
      }`}
      style={{
        background: post.is_bad_beat ? undefined : post.bg_color,
        transform: `rotate(${post.rotation}deg)`,
        animationDelay: `${Math.min(index * 0.06, 0.9)}s`,
      }}
    >
      {/* Decorative Banana Splat in Top Right of Bad Beat Cards */}
      {post.is_bad_beat && (
        <div className="absolute -top-5 -right-5 w-14 h-14 pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] z-10">
          <Image
            src="/img/banana-splat.svg"
            alt="Banana Splat!"
            fill
            className="object-contain animate-float"
            priority
          />
        </div>
      )}

      <div>
        <p
          className={`text-xl md:text-2xl leading-snug break-words ${FONT_CLASS[post.font_family]}`}
          style={{ color: post.is_bad_beat ? '#ffd13b' : post.font_color }}
        >
          {post.message}
        </p>
      </div>

      <div className="mt-4">
        {/* Rating/Interactive Row (Only for Bad Beats) */}
        {post.is_bad_beat ? (
          <div 
            className="flex justify-between items-center gap-3 border-t border-dashed pt-3 mb-3"
            style={{ borderColor: `rgba(255,209,59,0.2)` }}
          >
            <button
              onClick={handleRate}
              disabled={isPending}
              className="px-4 py-2 bg-yellow hover:bg-yellow-bright disabled:opacity-50 text-felt-deep font-bold rounded-lg text-xs uppercase tracking-widest transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              {isPending ? 'THROWING...' : 'Throw Banana'}
            </button>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-felt-deep/60 rounded-full border border-yellow/30 shadow-inner">
              <span className="text-xs">🍌</span>
              <span className="text-xs font-bold text-yellow font-mono">{post.banana_count || 0}</span>
            </div>
          </div>
        ) : null}

        {/* Card Footer (Author & Date) */}
        <div
          className="flex items-baseline justify-between gap-3 border-t border-dashed pt-2"
          style={{ borderColor: post.is_bad_beat ? 'rgba(255,209,59,0.2)' : `${post.font_color}44` }}
        >
          <span
            className="font-[family-name:var(--font-hand)] text-lg"
            style={{ color: post.is_bad_beat ? '#ffd13b' : post.font_color }}
          >
            — {post.author}
          </span>
          <span
            className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-wider opacity-60"
            style={{ color: post.is_bad_beat ? '#ffd13b' : post.font_color }}
          >
            {timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
