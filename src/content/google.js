import { GOOGLE_DEFAULTS } from '../settings.js'

const BLURRED_CLASS = 'kitchen-sink-ai-overview'
// Container candidates from EasyList's fanboy-addon/fanboy_ai_suggestions.txt.
const CANDIDATES = '#Odp5De, #main > [data-ved]'
// Inline sections: github.com/insin/ai-overview-hider-for-google/blob/main/style.css
const INLINE_MARKER = '#rso path[d^="M235.5 471C235.5 438.423 229.22 407.807"]'
const OVERVIEW_LABEL = /^(?:AI Overview|Übersicht mit KI)$/i
const style = document.createElement('style')
style.textContent = `.${BLURRED_CLASS} { filter: blur(8px) !important; }`

let pendingFrame = 0

function isOverview(element) {
  if (element.id === 'Odp5De') {
    return /AI Overview|Übersicht mit KI/i.test(element.textContent)
  }

  // The fallback container is shared with other result types. Require its
  // heading, not a mention in a web result, and never blur a results wrapper.
  if (!element.matches('#main > [data-ved]') ||
      element.matches('#rso, #search') ||
      element.querySelector('#Odp5De, #rso, #search')) return false

  const heading = element.querySelector('h1, h2, [role="heading"]')
  return heading && !heading.closest('a') && !heading.querySelector('a') &&
    OVERVIEW_LABEL.test(heading.textContent.trim())
}

function scan() {
  if (!style.isConnected && document.documentElement) {
    document.documentElement.append(style)
  }

  const overviews = new Set([...document.querySelectorAll(CANDIDATES)].filter(isOverview))
  document.querySelectorAll(INLINE_MARKER).forEach((marker) => {
    const section = marker.closest('#rso div.ULSxyf') || marker.closest('#rso > div.MjjYud')
    if (section) overviews.add(section)
  })

  // Prefer the innermost match: shared wrappers can also contain ordinary
  // results, and matching both a parent and child would double the blur.
  overviews.forEach((element) => {
    if ([...overviews].some((other) => other !== element && element.contains(other))) {
      overviews.delete(element)
    }
  })

  document.querySelectorAll(`.${BLURRED_CLASS}`).forEach((element) => {
    if (!overviews.has(element)) element.classList.remove(BLURRED_CLASS)
  })
  overviews.forEach((element) => {
    if (!element.classList.contains(BLURRED_CLASS)) element.classList.add(BLURRED_CLASS)
  })
}

const observer = new MutationObserver(() => {
  if (pendingFrame) return
  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = 0
    scan()
  })
})

function applySetting(settings) {
  observer.disconnect()
  cancelAnimationFrame(pendingFrame)
  pendingFrame = 0

  if (!settings.googleBlurAiOverviews) {
    style.remove()
    document.querySelectorAll(`.${BLURRED_CLASS}`).forEach((element) => {
      element.classList.remove(BLURRED_CLASS)
    })
    return
  }

  scan()
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['id', 'data-ved', 'role', 'class', 'd'],
  })
}

function sync() {
  chrome.storage.local.get(GOOGLE_DEFAULTS, applySetting)
}

sync()

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.googleBlurAiOverviews) sync()
})
