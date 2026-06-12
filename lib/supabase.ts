import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export type WallPost = {
  id: string
  author: string
  message: string
  font_color: string
  bg_color: string
  font_family: 'display' | 'serif' | 'mono' | 'hand'
  rotation: number
  created_at: string
}

export type BudgetRow = {
  id: string
  category: string
  amount_cents: number
  note: string | null
  occurred_at: string
}
