// Generate all Monkey Business images with Gemini 3 Pro Image
import fs from 'node:fs/promises'
import path from 'node:path'

const API_KEY = 'AIzaSyC7BmjCU-gHHFZFVMHwBLvWjgXypw_ADzA'
const MODEL = 'gemini-3-pro-image-preview'
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

const OUT = path.resolve('public/img')
await fs.mkdir(OUT, { recursive: true })

const jobs = [
  {
    file: 'hero-monkey.png',
    prompt:
      'Cinematic hero illustration for a poker club called "Monkey Business". A debonair capuchin monkey wearing a 1970s green velvet tuxedo with a banana-yellow bowtie, smoking a thin cigar, sitting at a dark mahogany poker table. Stacks of gold and ivory poker chips, a pair of aces showing, warm brass pendant lamp casting a pool of light. Background: deep emerald felt wall with tropical monstera leaves, vintage neon sign glow. Color palette: deep felt green, emerald, banana yellow, aged brass, cream, smoky black. Vintage 1970s Havana poker lounge vibe. Painterly editorial illustration, art-nouveau poster influence, rich texture, grain.',
  },
  {
    file: 'bg-felt.png',
    prompt:
      'Seamless rich dark poker-felt green fabric background texture, with subtle woven threads, deep #0a3d1f emerald color, soft vignette corners, faint golden sparkle dust floating, no text, no logos, pure tactile background.',
  },
  {
    file: 'bg-jungle.png',
    prompt:
      'Lush dark tropical jungle backdrop at night, large monstera and palm leaves in silhouette, deep forest green and teal shadows, small specks of banana-yellow bokeh light filtering through, vintage botanical plate meets noir cinema. No text. Moody, atmospheric, cinematic.',
  },
  {
    file: 'bg-schedule.png',
    prompt:
      'Vintage 1970s casino schedule poster background. Cream aged paper with coffee stains, ornate art-deco borders in brass gold, tiny playing card suit motifs (spade, heart, club, diamond) scattered, no text, subtle halftone print texture. Warm off-white with golden and green accents.',
  },
  {
    file: 'bg-wall.png',
    prompt:
      'Aged cork bulletin board background with thumbtacks, faded green paint around the edges, scattered polaroid corners, faint graffiti scribbles in gold and yellow marker, soft shadow. Handcrafted, lived-in, speakeasy back-room wall. No readable text.',
  },
  {
    file: 'bg-budget.png',
    prompt:
      'Old casino cage ledger book background: aged cream parchment paper with faint ruled lines, coffee ring stains, gold foil edging, small ink smudges, ornate corner flourishes. No text. Warm, analog, trustworthy bookkeeping feel.',
  },
  {
    file: 'mascot-dealer.png',
    prompt:
      'Portrait of a wise old capuchin monkey dealer, wearing a pinstripe green vest and red silk tie, fedora tipped forward, dealing a playing card to the viewer, brass ring on finger. Background: deep green felt out of focus. Soft dramatic rembrandt lighting, oil-painting style, highly detailed, editorial magazine quality, cream and banana accents.',
  },
  {
    file: 'banana-stack.png',
    prompt:
      'Still life illustration: a stack of poker chips shaped like bananas, glowing in warm brass pendant light, on a green felt table, a single ace of spades leaning against the stack. Dark atmospheric background. Painterly, whimsical, high contrast, vintage advertising art.',
  },
  {
    file: 'neon-sign.png',
    prompt:
      'Vintage neon sign shaped like the words "MONKEY BUSINESS" glowing in banana-yellow and emerald green neon tubes, mounted on a dark brick wall, subtle flicker, reflection on a wet sidewalk below. Close up, retro Las Vegas / Havana signage, atmospheric rain haze. Cinematic.',
  },
]

async function generate(job) {
  console.log(`→ ${job.file}...`)
  const body = {
    contents: [{ role: 'user', parts: [{ text: job.prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  }
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    console.error(`✗ ${job.file}: ${res.status} ${t.slice(0, 200)}`)
    return null
  }
  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const imgPart = parts.find((p) => p.inlineData?.data)
  if (!imgPart) {
    console.error(`✗ ${job.file}: no image in response`)
    console.error(JSON.stringify(data).slice(0, 300))
    return null
  }
  const buf = Buffer.from(imgPart.inlineData.data, 'base64')
  const outPath = path.join(OUT, job.file)
  await fs.writeFile(outPath, buf)
  console.log(`✓ ${job.file} (${buf.length} bytes)`)
  return outPath
}

// Run all in parallel
const results = await Promise.allSettled(jobs.map(generate))
const ok = results.filter((r) => r.status === 'fulfilled' && r.value).length
console.log(`\nDone: ${ok}/${jobs.length} images generated.`)
