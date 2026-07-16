import fs from 'node:fs/promises'
import path from 'node:path'

const CACHE_DIR = '/tmp/pokerbros-cache'

export type PlayerSeat = {
  seat: number
  name: string
  isWinner: boolean
  isLoser: boolean
  cards: string[] | null
  pattern: string | null
  folded: boolean
}

export type ParsedHand = {
  board: string[]
  seats: PlayerSeat[]
}

async function getCachedHand(token: string): Promise<ParsedHand | null> {
  try {
    const file = path.join(CACHE_DIR, `${token}.json`)
    const data = await fs.readFile(file, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

async function setCachedHand(token: string, data: ParsedHand): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const file = path.join(CACHE_DIR, `${token}.json`)
    await fs.writeFile(file, JSON.stringify(data), 'utf8')
  } catch (e) {
    // Ignore
  }
}

export async function fetchHandData(message: string): Promise<ParsedHand | null> {
  // Regex to match PokerBros replay link
  const match = message.match(/https:\/\/s\.pokerbros\.net\/\?t=([a-zA-Z0-9]+)/)
  if (!match) return null

  const tokenParam = match[1]
  if (tokenParam.length < 11) return null

  const token = tokenParam.substring(0, 8)
  const tp = tokenParam.substring(10, 11)

  // Check cache first
  const cached = await getCachedHand(token)
  if (cached) return cached

  // Determine endpoint
  let url = 'https://sa.pokerbros.net/pokerbrosAPI/replayInfo.php'
  if (tp === '0' || tp === '1') {
    url = 'https://da7175077c01a23ade5956b8a2bba900.pokerbros.net/pokerbrosAPI/replayInfo.php'
  }

  try {
    const res = await fetch(`${url}?s=${token}`, {
      headers: {
        'sec-ch-ua-platform': '"Linux"',
        'referer': 'https://s.pokerbros.net/',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36',
        'sec-ch-ua': '"HeadlessChrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'origin': 'https://s.pokerbros.net'
      }
    })

    if (!res.ok) return null
    const data = await res.json()
    if (data.err === 1 || !data.gameResult) return null

    const board: string[] = data.gameResult.sharedcards || []
    const players = data.players || {}
    const seats: PlayerSeat[] = []

    // Get showdown details to identify winners/losers and active cards
    const showdownDetails: Record<number, { cards: string[], pattern: string, prize: number }> = {}
    const list = data.gameResult.sidepotsdetail?.[0] || []
    for (const p of list) {
      if (p.cards && p.cards.length > 0) {
        showdownDetails[p.uid] = {
          cards: p.cards,
          pattern: p.pattern || '',
          prize: p.prize || 0
        }
      }
    }

    // Sort showdown uids by prize to identify winner vs loser
    const showdownUids = Object.keys(showdownDetails).map(Number)
    showdownUids.sort((a, b) => showdownDetails[b].prize - showdownDetails[a].prize)
    const winnerUid = showdownUids[0] || null
    const loserUid = showdownUids[1] || null

    // Map all players dealt into their seats
    for (const uidStr of Object.keys(players)) {
      const uid = Number(uidStr)
      const p = players[uidStr]
      const showdown = showdownDetails[uid]

      seats.push({
        seat: p.seat,
        name: p.displayID || `Player ${p.seat}`,
        isWinner: uid === winnerUid,
        isLoser: uid === loserUid,
        cards: showdown ? showdown.cards : null,
        pattern: showdown ? showdown.pattern : null,
        folded: !showdown
      })
    }

    const parsed: ParsedHand = { board, seats }
    await setCachedHand(token, parsed)
    return parsed
  } catch (e) {
    console.error('Error fetching/parsing PokerBros hand:', e)
    return null
  }
}
