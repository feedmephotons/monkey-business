import { supabase, type WallPost as WallPostType } from '@/lib/supabase'
import { fetchHandData, type ParsedHand } from '@/lib/pokerbros'
import Link from 'next/link'
import Image from 'next/image'
import WallPost from '@/components/WallPost'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export type EnrichedWallPost = WallPostType & {
  handData?: ParsedHand | null
}

async function getBadBeatPosts(): Promise<WallPostType[]> {
  const { data, error } = await supabase
    .from('mb_wall_posts')
    .select('*')
    .eq('is_bad_beat', true)
    .order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []) as WallPostType[]
}

export default async function BadBeatsArchivePage() {
  const posts = await getBadBeatPosts()

  // Enrich bad beat posts with PokerBros hand details
  const enrichedPosts: EnrichedWallPost[] = await Promise.all(
    posts.map(async (post) => {
      if (post.message.includes('https://s.pokerbros.net/')) {
        try {
          const handData = await fetchHandData(post.message)
          return { ...post, handData }
        } catch (e) {
          console.error('Error enriching post:', e)
          return post
        }
      }
      return post
    })
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between select-none">
      {/* Header */}
      <header className="border-b border-yellow/10 bg-[#080808]/80 backdrop-blur sticky top-0 z-50 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-yellow font-bold uppercase tracking-wider hover:opacity-80 transition font-[family-name:var(--font-mono)] text-xs sm:text-sm">
            <span>← Back to Club</span>
          </Link>
          <div className="text-right">
            <h1 className="text-sm sm:text-lg font-mono text-yellow font-bold tracking-widest uppercase">
              Bad Beat Archive 🏆
            </h1>
            <p className="text-[9px] sm:text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Monkey Biz Poker Hall of Pain
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col items-center gap-8">
        {/* Title Block */}
        <div className="text-center space-y-2 max-w-xl">
          <span className="text-[10px] bg-red/10 text-red border border-red/25 px-3 py-1 rounded-full uppercase tracking-widest font-mono font-bold animate-pulse">
            Locked History
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-headline)] uppercase text-white pt-1">
            Hall of <em className="text-red not-italic">Pain</em>
          </h2>
          <p className="text-sm text-white/60 font-[family-name:var(--font-body)] italic">
            The permanent, locked museum of the most legendary coolered hands, river suckouts, and bad beats in Monkey Biz Poker history.
          </p>
        </div>

        {/* CARDS LIST (WITHOUT INTERACTIVE ICONS AS SPECIFIED) */}
        {enrichedPosts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-[family-name:var(--font-hand)] text-3xl text-red/70">
              The archive is currently empty.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-wrap justify-center gap-6 mt-6">
            {enrichedPosts.map((p, i) => (
              <div key={p.id} className="w-full max-w-[340px] shrink-0">
                {/* Custom Locked Archive Card */}
                <div className="relative rounded-sm border border-light-blue/20 bg-navy-deep/80 backdrop-blur p-5 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[460px]">
                  {/* Neon border shine */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red via-transparent to-red opacity-50" />
                  
                  {/* PokerBros Replay Preview Block */}
                  {p.message.includes('https://s.pokerbros.net/') && (
                    <div className="mb-4">
                      <div className="relative aspect-[16/9] w-full bg-black/50 border border-white/5 rounded-sm overflow-hidden group shadow-md">
                        <img
                          src="/img/logo.png"
                          alt="PokerBros Hand Replay board"
                          className="w-1/2 h-1/2 object-contain mx-auto my-6 opacity-30 transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-3 text-center transition group-hover:bg-black/25">
                          <a
                            href={p.message.split('|||')[0].trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-red/90 border border-white/25 flex items-center justify-center shadow-lg transition duration-200 transform group-hover:scale-110"
                          >
                            <span className="text-white text-lg font-bold pl-0.5">▶</span>
                          </a>
                          <span className="mt-2 text-[9px] font-mono tracking-widest text-white/80 uppercase bg-black/60 px-2 py-0.5 rounded border border-white/10">
                            Watch Replay Video
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black tracking-widest uppercase text-red bg-red/10 px-2 py-0.5 rounded border border-red/20">
                          🎰 BAD BEAT
                        </span>
                        <span className="text-[10px] font-mono font-bold text-white/40">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-white/90 font-[family-name:var(--font-body)] text-sm leading-relaxed mb-4 break-words line-clamp-6 italic">
                        &ldquo;{p.message.split('|||')[0].replace(/https?:\/\/[^\s]+/g, '').trim() || 'No story provided...'}&rdquo;
                      </p>
                    </div>

                    {/* Score Summary */}
                    <div className="bg-white/5 border border-white/5 rounded p-3 mt-4 text-center">
                      <p className="text-[0.6rem] uppercase tracking-widest text-white/50 font-mono font-bold mb-1">
                        🏆 Contest Record Score
                      </p>
                      {(() => {
                        const totalVotes = (p.banana_1 || 0) + (p.banana_2 || 0) + (p.banana_3 || 0) + (p.banana_4 || 0) + (p.banana_5 || 0)
                        const weightedSum = (p.banana_1 * 1) + (p.banana_2 * 2) + (p.banana_3 * 3) + (p.banana_4 * 4) + (p.banana_5 * 5)
                        const rawAvg = totalVotes > 0 ? (weightedSum / totalVotes) * 2 : 0
                        const totalScoreLabel = totalVotes > 0 ? `${rawAvg.toFixed(1)} / 10` : 'No votes cast'
                        return (
                          <p className="text-lg font-mono font-extrabold text-yellow uppercase">
                            🔥 {totalScoreLabel}
                          </p>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow/10 bg-[#080808]/80 py-6 px-4 text-center">
        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
          &copy; 2026 Monkey Biz Poker Club. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
