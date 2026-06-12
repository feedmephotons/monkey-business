import type { WallPost as WallPostType } from '@/lib/supabase'

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
  return (
    <div
      className={`wall-card rise`}
      style={{
        background: post.bg_color,
        transform: `rotate(${post.rotation}deg)`,
        animationDelay: `${Math.min(index * 0.06, 0.9)}s`,
      }}
    >
      <p
        className={`text-xl md:text-2xl leading-snug break-words ${FONT_CLASS[post.font_family]}`}
        style={{ color: post.font_color }}
      >
        {post.message}
      </p>
      <div
        className="mt-4 flex items-baseline justify-between gap-3 border-t border-dashed pt-2"
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
  )
}
