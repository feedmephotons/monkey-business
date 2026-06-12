'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

function admin() {
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type PostInput = {
  author: string
  message: string
  font_color: string
  bg_color: string
  font_family: 'display' | 'serif' | 'mono' | 'hand'
}

export async function postToWall(input: PostInput) {
  const author = (input.author || '').trim().slice(0, 40) || 'Anon Monkey'
  const message = (input.message || '').trim().slice(0, 500)
  if (!message) {
    return { ok: false as const, error: 'Say something first, champ.' }
  }

  const rotation = Math.round((Math.random() * 8 - 4) * 10) / 10

  const { error } = await admin()
    .from('mb_wall_posts')
    .insert({
      author,
      message,
      font_color: input.font_color,
      bg_color: input.bg_color,
      font_family: input.font_family,
      rotation,
    })

  if (error) {
    console.error('wall insert error', error)
    return { ok: false as const, error: 'Could not post. Try again.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}
