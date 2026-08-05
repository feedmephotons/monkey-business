import { supabase, type WallPost as WallPostType, type BudgetRow } from '@/lib/supabase'
import FoldableClientPage from '@/components/FoldableClientPage'
import { fetchHandData, type ParsedHand } from '@/lib/pokerbros'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export type EnrichedWallPost = WallPostType & {
  handData?: ParsedHand | null
}

async function getWallPosts(): Promise<WallPostType[]> {
  const { data, error } = await supabase
    .from('mb_wall_posts')
    .select('*')
    .not('author', 'in', '("bracket_state","draft_bracket_state")')
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []) as WallPostType[]
}

async function getBudget(): Promise<BudgetRow[]> {
  const { data, error } = await supabase
    .from('mb_budget_ledger')
    .select('*')
    .order('occurred_at', { ascending: true })
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []) as BudgetRow[]
}

export default async function FoldablePreviewHome() {
  const [posts, budget] = await Promise.all([getWallPosts(), getBudget()])

  const enrichedPosts: EnrichedWallPost[] = await Promise.all(
    posts.map(async (post) => {
      if (post.is_bad_beat && post.message.includes('https://s.pokerbros.net/')) {
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
    <div>
      {/* Banner indicating this is a preview of the foldable layout */}
      <div className="bg-yellow text-black font-extrabold text-xs py-2 px-4 text-center tracking-widest uppercase sticky top-0 z-[100] shadow-md flex items-center justify-between">
        <span>🐒 MONKEY BIZ CONFIDENTIAL PREVIEW: FOLDABLE LAYOUT 🐒</span>
        <a href="/" className="underline hover:text-red-900 transition">Back to Live Site →</a>
      </div>
      <FoldableClientPage posts={enrichedPosts} budget={budget} />
    </div>
  )
}
