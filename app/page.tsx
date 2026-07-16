import { supabase, type WallPost as WallPostType, type BudgetRow } from '@/lib/supabase'
import ClientPage from '@/components/ClientPage'
import { fetchHandData, type ParsedHand } from '@/lib/pokerbros'

export const revalidate = 0

export type EnrichedWallPost = WallPostType & {
  handData?: ParsedHand | null
}

async function getWallPosts(): Promise<WallPostType[]> {
  const { data, error } = await supabase
    .from('mb_wall_posts')
    .select('*')
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

export default async function Home() {
  const [posts, budget] = await Promise.all([getWallPosts(), getBudget()])

  // Enrich bad beat posts with PokerBros hand details
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

  return <ClientPage posts={enrichedPosts} budget={budget} />
}
