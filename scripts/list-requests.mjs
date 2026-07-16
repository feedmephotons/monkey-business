import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  page.on('request', request => {
    console.log('Request:', request.method(), request.url())
  })

  await page.goto('https://s.pokerbros.net/?t=eo8odkrt002en')
  await page.waitForTimeout(3000)
  await browser.close()
}

run()
