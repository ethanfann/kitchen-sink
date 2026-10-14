import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { chromium } from 'playwright'

test('blur only AI Overviews, including those between ordinary results', { timeout: 30000 }, async (t) => {
  const extensionPath = resolve('dist')
  // Use this machine's Chromium, or `npx playwright install chromium` elsewhere.
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  })
  t.after(() => context.close())

  const popup = await context.newPage()
  await popup.goto('chrome://extensions/')
  const extensionId = await popup.evaluate(async () => {
    const extensions = await chrome.developerPrivate.getExtensionsInfo()
    return extensions.find(extension => extension.name === 'Kitchen Sink').id
  })
  await popup.goto(`chrome-extension://${extensionId}/src/popup/index.html`)

  const page = await context.newPage()
  const fixture = readFileSync(new URL('./fixtures/google-ai.html', import.meta.url), 'utf8')
  await page.route('https://www.google.com/search?*', route => route.fulfill({
    contentType: 'text/html',
    body: fixture,
  }))
  await page.goto('https://www.google.com/search?q=object+fromentries')

  // Check ancestor filters too: a clear child inside a blurred wrapper is not clear.
  async function expectBlur(id, blurred) {
    await page.waitForFunction(({ id, blurred }) => {
      let element = document.getElementById(id)
      if (!element) return false
      const filters = []
      for (; element; element = element.parentElement) {
        const filter = getComputedStyle(element).filter
        if (filter !== 'none') filters.push(filter)
      }
      return blurred ? filters.length === 1 && filters[0] === 'blur(8px)' : filters.length === 0
    }, { id, blurred }, { timeout: 3000 })
  }

  const initialBounds = await page.locator('#overview').boundingBox()
  await expectBlur('overview', true)
  for (const id of ['before', 'after', 'article']) await expectBlur(id, false)

  await popup.locator('label[for="google-blur-ai-overviews"]').click()
  await page.bringToFront()
  await expectBlur('overview', false)
  assert.deepEqual(await page.locator('#overview').boundingBox(), initialBounds)
  await page.reload()
  await expectBlur('overview', false)
  await popup.reload()
  await popup.waitForFunction(() => document.getElementById('google-blur-ai-overviews').checked === false)

  await popup.locator('label[for="google-blur-ai-overviews"]').click()
  await page.bringToFront()
  await expectBlur('overview', true)

  // Google can replace a result section, then stream in the identifying icon.
  const overview = await page.evaluate(html => {
    return new DOMParser().parseFromString(html, 'text/html').getElementById('overview').outerHTML
  }, fixture)
  await page.locator('#overview').evaluate(element => element.remove())
  await page.locator('#after').evaluate((element, html) => element.insertAdjacentHTML('beforebegin', html), overview)
  await expectBlur('overview', true)
  await page.locator('#overview svg path').evaluate(element => element.setAttribute('d', 'M0 0'))
  await expectBlur('overview', false)
  await page.locator('#overview svg path').evaluate(element => element.setAttribute('d', 'M235.5 471C235.5 438.423 229.22 407.807 200 400'))
  await expectBlur('overview', true)
  for (const id of ['before', 'after', 'article']) await expectBlur(id, false)

  await page.locator('#overview').evaluate(element => {
    const inner = document.createElement('div')
    inner.id = 'Odp5De'
    inner.append(...element.childNodes)
    element.append(inner)
  })
  await expectBlur('Odp5De', true)
  for (const id of ['before', 'after', 'article']) await expectBlur(id, false)

  // Mobile uses a direct result unit, without the desktop section class.
  await page.locator('#rso').evaluate((element, html) => {
    element.innerHTML = `<div id="before">Ordinary result above</div>${html}<div id="after">Ordinary result below</div>`
    element.querySelector('#overview').className = 'MjjYud'
  }, overview)
  await expectBlur('overview', true)
  for (const id of ['before', 'after']) await expectBlur(id, false)

  // Keep the previously supported top-of-page overview working as well.
  await page.locator('#main').evaluate(element => {
    element.innerHTML = '<div id="Odp5De"><h2>AI Overview</h2><p>Top-of-page answer</p></div><div id="after">Ordinary result below</div>'
  })
  await expectBlur('Odp5De', true)
  await expectBlur('after', false)
})
