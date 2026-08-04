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
  const dbMessage = input.is_bad_beat ? `${message}|||source|||website` : message

  const { error } = await admin()
    .from('mb_wall_posts')
    .insert({
      author,
      message: dbMessage,
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

  // Separate ice first
  const iceParts = post.message.split('|||ice|||')
  const baseWithSuffer = iceParts[0]
  const iceSuffix = iceParts[1] ? `|||ice|||${iceParts[1]}` : ''

  // Separate suffer
  const sufferParts = baseWithSuffer.split('|||suffer|||')
  const baseWithSplats = sufferParts[0]
  const sufferSuffix = sufferParts[1] ? `|||suffer|||${sufferParts[1]}` : ''

  // Parse out splat count suffix if any from baseWithSplats
  const splatParts = baseWithSplats.split('|||splats|||')
  const baseMessage = splatParts[0]
  const splatSuffix = splatParts[1] ? `|||splats|||${splatParts[1]}` : ''

  // Append comment with delimiter to the base message
  const commentPayload = `${authorClean}: ${textClean}`
  const updatedBase = `${baseMessage}|||comment|||${commentPayload}`

  // Re-assemble final message string keeping splats, suffer, and ice at the end
  const updatedMessage = `${updatedBase}${splatSuffix}${sufferSuffix}${iceSuffix}`

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

export async function splatPost(postId: string) {
  // Fetch current message
  const { data: post, error: fetchError } = await admin()
    .from('mb_wall_posts')
    .select('message')
    .eq('id', postId)
    .single()

  if (fetchError || !post) {
    console.error('fetch error during splatting', fetchError)
    return { ok: false as const, error: 'Post not found.' }
  }

  const messageStr = post.message || ''

  // Separate ice first
  const iceParts = messageStr.split('|||ice|||')
  const baseWithSuffer = iceParts[0]
  const iceSuffix = iceParts[1] ? `|||ice|||${iceParts[1]}` : ''

  // Separate suffer
  const sufferParts = baseWithSuffer.split('|||suffer|||')
  const baseWithSplats = sufferParts[0]
  const sufferSuffix = sufferParts[1] ? `|||suffer|||${sufferParts[1]}` : ''

  // Parse out splat count from baseWithSplats
  const splatParts = baseWithSplats.split('|||splats|||')
  const baseMessage = splatParts[0]
  const currentSplatCount = splatParts[1] ? parseInt(splatParts[1], 10) || 0 : 0

  // Increment and assemble base with splats
  const updatedBase = `${baseMessage}|||splats|||${currentSplatCount + 1}`

  // Re-assemble final message keeping suffixes intact
  const updatedMessage = `${updatedBase}${sufferSuffix}${iceSuffix}`

  // Update post
  const { error: updateError } = await admin()
    .from('mb_wall_posts')
    .update({ message: updatedMessage })
    .eq('id', postId)

  if (updateError) {
    console.error('update error during splatting', updateError)
    return { ok: false as const, error: 'Could not submit splat.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}

export async function sufferPost(postId: string) {
  // Fetch current message
  const { data: post, error: fetchError } = await admin()
    .from('mb_wall_posts')
    .select('message')
    .eq('id', postId)
    .single()

  if (fetchError || !post) {
    console.error('fetch error during suffering', fetchError)
    return { ok: false as const, error: 'Post not found.' }
  }

  const messageStr = post.message || ''

  // Separate ice first
  const iceParts = messageStr.split('|||ice|||')
  const baseWithSuffer = iceParts[0]
  const iceSuffix = iceParts[1] ? `|||ice|||${iceParts[1]}` : ''

  // Parse out suffer count if any from baseWithSuffer
  const sufferParts = baseWithSuffer.split('|||suffer|||')
  const baseWithSplats = sufferParts[0]
  const currentSufferCount = sufferParts[1] ? parseInt(sufferParts[1], 10) || 0 : 0

  // Increment and assemble final message string
  const updatedBaseWithSuffer = `${baseWithSplats}|||suffer|||${currentSufferCount + 1}`
  const updatedMessage = `${updatedBaseWithSuffer}${iceSuffix}`

  // Update post
  const { error: updateError } = await admin()
    .from('mb_wall_posts')
    .update({ message: updatedMessage })
    .eq('id', postId)

  if (updateError) {
    console.error('update error during suffering', updateError)
    return { ok: false as const, error: 'Could not submit suffer.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}

export async function icePost(postId: string) {
  // Fetch current message
  const { data: post, error: fetchError } = await admin()
    .from('mb_wall_posts')
    .select('message')
    .eq('id', postId)
    .single()

  if (fetchError || !post) {
    console.error('fetch error during icing', fetchError)
    return { ok: false as const, error: 'Post not found.' }
  }

  const messageStr = post.message || ''

  // Parse out ice count
  const iceParts = messageStr.split('|||ice|||')
  const baseWithSuffer = iceParts[0]
  const currentIceCount = iceParts[1] ? parseInt(iceParts[1], 10) || 0 : 0

  // Increment and assemble final message string
  const updatedMessage = `${baseWithSuffer}|||ice|||${currentIceCount + 1}`

  // Update post
  const { error: updateError } = await admin()
    .from('mb_wall_posts')
    .update({ message: updatedMessage })
    .eq('id', postId)

  if (updateError) {
    console.error('update error during icing', updateError)
    return { ok: false as const, error: 'Could not submit ice.' }
  }

  revalidatePath('/')
  return { ok: true as const }
}

export async function getBracketState() {
  const { data, error } = await admin()
    .from('mb_wall_posts')
    .select('message')
    .eq('author', 'bracket_state')
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching bracket state:', error)
    return { ok: false as const, error: error.message }
  }
  return { ok: true as const, state: data?.message || null }
}

export async function saveBracketState(stateJson: string) {
  const { data, error: findError } = await admin()
    .from('mb_wall_posts')
    .select('id')
    .eq('author', 'bracket_state')
    .maybeSingle()

  if (findError) {
    console.error('Error finding bracket state post:', findError)
    return { ok: false as const, error: findError.message }
  }

  if (data) {
    const { error } = await admin()
      .from('mb_wall_posts')
      .update({ message: stateJson })
      .eq('id', data.id)
    if (error) {
      console.error('Error updating bracket state:', error)
      return { ok: false as const, error: error.message }
    }
  } else {
    const { error } = await admin()
      .from('mb_wall_posts')
      .insert({
        author: 'bracket_state',
        message: stateJson,
        font_color: '#f4c430',
        bg_color: '#0a3d1f',
        font_family: 'mono',
        rotation: 0,
        is_bad_beat: false
      })
    if (error) {
      console.error('Error inserting bracket state:', error)
      return { ok: false as const, error: error.message }
    }
  }

  revalidatePath('/preview')
  revalidatePath('/bracket')
  return { ok: true as const }
}

