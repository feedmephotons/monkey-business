import fs from 'node:fs/promises'

async function run() {
  const data = JSON.parse(await fs.readFile('scripts/replay-data.json', 'utf8'))
  
  const communityCards = data.gameResult?.sharedcards || []
  
  // Find players
  const players = data.players || {}
  const showdownPlayers = []
  
  const list = data.gameResult?.sidepotsdetail?.[0] || []
  for (const p of list) {
    if (p.cards && p.cards.length > 0) {
      const info = players[p.uid] || {}
      showdownPlayers.push({
        uid: p.uid,
        name: info.displayID || `Player ${p.seat}`,
        seat: p.seat,
        prize: p.prize || 0,
        cards: p.cards,
        pattern: p.pattern,
      })
    }
  }

  // Sort: winners first
  showdownPlayers.sort((a, b) => b.prize - a.prize)

  console.log('Board:', communityCards)
  console.log('Showdown Players:', showdownPlayers)
}

run()
