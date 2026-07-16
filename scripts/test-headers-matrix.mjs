async function test(headers) {
  try {
    const res = await fetch('https://sa.pokerbros.net/pokerbrosAPI/replayInfo.php?s=eo8odkrt', { headers })
    const text = await res.text()
    if (!text.includes('"err":1')) {
      return { ok: true, length: text.length, preview: text.slice(0, 100) }
    }
    return { ok: false, preview: text }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function run() {
  const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36'
  
  const cases = [
    { name: 'no headers', h: {} },
    { name: 'only referer', h: { 'Referer': 'https://s.pokerbros.net/' } },
    { name: 'only lowercase referer', h: { 'referer': 'https://s.pokerbros.net/' } },
    { name: 'only user-agent', h: { 'User-Agent': ua } },
    { name: 'referer + user-agent', h: { 'Referer': 'https://s.pokerbros.net/', 'User-Agent': ua } },
    { name: 'referer + user-agent + origin', h: { 'Referer': 'https://s.pokerbros.net/', 'User-Agent': ua, 'Origin': 'https://s.pokerbros.net' } },
  ]

  for (const c of cases) {
    const r = await test(c.h)
    console.log(`Case: ${c.name} ->`, r)
  }
}

run()
