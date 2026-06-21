import { supabase, type WallPost as WallPostType, type BudgetRow } from '@/lib/supabase'
import ClientPage from '@/components/ClientPage'

export const revalidate = 0

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

  return <ClientPage posts={posts} budget={budget} />
}
