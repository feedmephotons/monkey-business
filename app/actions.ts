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
  is_bad_beat?: boolean
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
      is_bad_beat: !!input.is_bad_beat,
    })

  if (error) {
    console.error('wall insert error', error)
    return { ok: false as const, error: 'Could not post. Try again.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}

export async function ratePost(postId: string, ratingTier: number) {
  if (ratingTier < 1 || ratingTier > 5) {
    return { ok: false as const, error: 'Invalid rating, champ.' }
  }

  const columnName = `banana_${ratingTier}`

  // Fetch current value
  const { data: post, error: fetchError } = await admin()
    .from('mb_wall_posts')
    .select(columnName)
    .eq('id', postId)
    .single()

  if (fetchError || !post) {
    console.error('fetch error during rating', fetchError)
    return { ok: false as const, error: 'Post not found.' }
  }

  const currentCount = (post as any)[columnName] || 0

  // Increment and update
  const { error: updateError } = await admin()
    .from('mb_wall_posts')
    .update({ [columnName]: currentCount + 1 })
    .eq('id', postId)

  if (updateError) {
    console.error('update error during rating', updateError)
    return { ok: false as const, error: 'Could not submit rating.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}

export async function addCommentToPost(postId: string, author: string, text: string) {
  const authorClean = (author || '').trim().slice(0, 40) || 'Anon Monkey'
  const textClean = (text || '').trim().slice(0, 200)
  if (!textClean) return { ok: false as const, error: 'Write something first!' }

  // Fetch current post message
  const { data: post, error: fetchError } = await admin()
    .from('mb_wall_posts')
    .select('message')
    .eq('id', postId)
    .single()

  if (fetchError || !post) return { ok: false as const, error: 'Post not found.' }

  // Append comment with delimiter
  const commentPayload = `${authorClean}: ${textClean}`
  const updatedMessage = `${post.message}|||comment|||${commentPayload}`

  // Update post
  const { error: updateError } = await admin()
    .from('mb_wall_posts')
    .update({ message: updatedMessage })
    .eq('id', postId)

  if (updateError) {
    console.error('comment update error', updateError)
    return { ok: false as const, error: 'Could not post comment.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}
