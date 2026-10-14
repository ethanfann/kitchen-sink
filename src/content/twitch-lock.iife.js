const MESSAGE_SOURCE = 'kitchen-sink-extension'
const QUALITY_STORAGE_KEY = 'video-quality'
const APPLY_DELAYS_MS = [0, 400, 1200, 3000]
const MIN_LOCK_HEIGHT = 720

let qualityEnabled = true
let lastPath = location.pathname
let cachedPlayer
let applyTimer
let historyHooked = false

function persistQualityGroup(group) {
  try {
    localStorage.setItem(QUALITY_STORAGE_KEY, JSON.stringify({ default: group }))
  } catch {
    // Storage can be unavailable in locked-down embeds.
  }
}

function fiberKey(node) {
  return Object.keys(node).find((key) => (
    key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
  ))
}

function walkFiber(start, match) {
  let fiber = start
  let depth = 0
  while (fiber && depth < 80) {
    const found = match(fiber)
    if (found) return found
    fiber = fiber.return
    depth += 1
  }
  return null
}

function fiberFrom(node) {
  const key = fiberKey(node)
  return key ? node[key] : null
}

function findPlayerFrom(video) {
  let el = video
  while (el) {
    const fiber = fiberFrom(el)
    if (fiber) {
      const player = walkFiber(fiber, (current) => {
        const instance = current.memoizedProps?.mediaPlayerInstance || current.stateNode
        if (instance && typeof instance.getQualities === 'function') return instance
        return null
      })
      if (player) return player
    }
    el = el.parentElement
  }
  return null
}

function getPlayer() {
  const video = document.querySelector('video')
  if (!video) return null
  if (cachedPlayer?.video === video) return cachedPlayer.player

  const player = findPlayerFrom(video)
  if (player) cachedPlayer = { video, player }
  return player
}

function currentGroup(player) {
  try {
    const quality = player.getQuality?.()
    if (typeof quality === 'string') return quality
    return quality?.group || null
  } catch {
    return null
  }
}

function qualityHeight(quality) {
  if (quality.height) return quality.height
  const fromGroup = parseInt(quality.group, 10)
  if (fromGroup) return fromGroup
  const fromName = String(quality.name || '').match(/(\d{3,4})p/)
  return fromName ? Number(fromName[1]) : 0
}

function qualityScore(quality) {
  return qualityHeight(quality) * 1000 + (quality.framerate || 0)
}

function normalizeQualities(raw) {
  if (!raw?.length) return []
  return raw.map((quality) => {
    if (typeof quality === 'string') {
      return {
        group: quality,
        name: quality,
        height: quality === 'chunked' ? 0 : (parseInt(quality, 10) || 0),
        framerate: quality.includes('60') ? 60 : 0,
      }
    }
    return quality
  }).filter((quality) => quality?.group && quality.group !== 'auto')
}

function pickBest(qualities) {
  if (!qualities.length) return null
  return qualities.reduce((best, quality) => (
    qualityScore(quality) > qualityScore(best) ? quality : best
  ))
}

function lockQuality(force = false) {
  if (!qualityEnabled) return false

  const player = getPlayer()
  if (!player) return false

  let qualities
  try {
    qualities = normalizeQualities(player.getQualities?.() || [])
  } catch {
    return false
  }

  const best = pickBest(qualities)
  if (!best) return false

  const height = qualityHeight(best)
  if (!force && height < MIN_LOCK_HEIGHT && qualities.length < 3) return false

  const group = best.group
  if (currentGroup(player) === group) {
    persistQualityGroup(group)
    return true
  }

  try {
    player.setAutoQualityMode?.(false)
    if (typeof player.setQuality === 'function') player.setQuality(group)
    persistQualityGroup(group)
    return true
  } catch {
    return false
  }
}

function releaseQuality() {
  persistQualityGroup('auto')

  const player = getPlayer()
  if (!player) return

  try {
    player.setAutoQualityMode?.(true)
    if (typeof player.setQuality === 'function') player.setQuality('auto')
  } catch {
    // Auto is not always a valid named quality.
  }
}

function scheduleApply() {
  window.clearTimeout(applyTimer)
  let index = 0

  const tick = () => {
    lockQuality(index === APPLY_DELAYS_MS.length - 1)
    index += 1
    if (index >= APPLY_DELAYS_MS.length) return
    applyTimer = window.setTimeout(tick, APPLY_DELAYS_MS[index] - APPLY_DELAYS_MS[index - 1])
  }

  applyTimer = window.setTimeout(tick, APPLY_DELAYS_MS[0])
}

function onRouteChange() {
  if (location.pathname === lastPath) return

  lastPath = location.pathname
  cachedPlayer = null
  if (qualityEnabled) scheduleApply()
}

function hookHistory() {
  if (historyHooked) return
  historyHooked = true

  for (const method of ['pushState', 'replaceState']) {
    const original = history[method]
    history[method] = function hookedHistory() {
      const result = original.apply(this, arguments)
      onRouteChange()
      return result
    }
  }

  window.addEventListener('popstate', onRouteChange)
}

window.addEventListener('message', (event) => {
  if (
    event.source !== window
    || event.data?.source !== MESSAGE_SOURCE
    || event.data?.type !== 'set-settings'
  ) return

  qualityEnabled = !!event.data.forceMaxQuality
  if (qualityEnabled) scheduleApply()
  else releaseQuality()
})

hookHistory()
scheduleApply()
