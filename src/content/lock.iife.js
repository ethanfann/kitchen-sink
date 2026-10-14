const PREFERRED_QUALITIES = [
  'highres',
  'hd4320',
  'hd2880',
  'hd2160',
  'hd1440',
  'hd1080',
  'hd720',
]
const RETRY_INTERVAL_MS = 400
const RETRY_DURATION_MS = 12_000
const MESSAGE_SOURCE = 'kitchen-sink-extension'

let qualityEnabled = false
let theaterEnabled = false
let theaterAppliedFor = null
let theaterClickedFor = null
let qualityRetryTimer
let theaterRetryTimer
let lastTheaterClickAt = 0

function isWatchPage() {
  return /\/(watch|shorts|live|embed)\b/.test(location.pathname)
    || location.hostname === 'music.youtube.com'
}

function getPlayer() {
  return document.getElementById('movie_player')
    || document.getElementById('shorts-player')
    || document.querySelector('.html5-video-player:not(#inline-preview-player)')
}

function pickTarget(levels) {
  const usable = levels.filter((quality) => quality && quality !== 'auto')
  return PREFERRED_QUALITIES.find((quality) => usable.includes(quality))
    || usable[0]
    || null
}

function pickFormatId(player, quality) {
  if (typeof player.getAvailableQualityData !== 'function') return undefined

  const matches = (player.getAvailableQualityData() || []).filter((row) => (
    row.quality === quality && row.isPlayable !== false
  ))
  const premium = matches.find((row) => row.paygatedQualityDetails)
  return (premium || matches[0])?.formatId
}

function lockQuality() {
  if (!qualityEnabled) return false

  const player = getPlayer()
  if (!player || typeof player.getAvailableQualityLevels !== 'function') return false

  const target = pickTarget(player.getAvailableQualityLevels() || [])
  if (!target) return false

  try {
    const formatId = pickFormatId(player, target)
    if (typeof player.setPlaybackQualityRange === 'function') {
      if (formatId == null) player.setPlaybackQualityRange(target, target)
      else player.setPlaybackQualityRange(target, target, formatId)
    }
    if (typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality(target)
    }
    return true
  } catch {
    return false
  }
}

function releaseQuality() {
  window.clearInterval(qualityRetryTimer)

  const player = getPlayer()
  if (!player) return

  try {
    if (typeof player.setPlaybackQualityRange === 'function') {
      player.setPlaybackQualityRange('auto', 'auto')
    }
    if (typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality('auto')
    }
  } catch {
    // Some embeds expose only part of the player API.
  }
}

function hookPlayerEvents() {
  const player = getPlayer()
  if (!player || player.dataset.kitchenSinkQualityHooked) return

  player.dataset.kitchenSinkQualityHooked = 'true'
  try {
    player.addEventListener('onStateChange', (state) => {
      if (state === 1 || state === 3) lockQuality()
    })
  } catch {
    // Some embeds do not expose the event API.
  }
}

function applyQualityWithRetries() {
  window.clearInterval(qualityRetryTimer)
  if (!qualityEnabled || !isWatchPage()) return

  hookPlayerEvents()
  if (lockQuality()) return

  const startedAt = Date.now()
  qualityRetryTimer = window.setInterval(() => {
    hookPlayerEvents()
    if (lockQuality() || Date.now() - startedAt >= RETRY_DURATION_MS) {
      window.clearInterval(qualityRetryTimer)
    }
  }, RETRY_INTERVAL_MS)
}

function persistTheaterCookie(enabled) {
  document.cookie = `wide=${enabled ? 1 : 0}; path=/; max-age=31536000`
}

function getWatchFlexy() {
  return document.querySelector('ytd-watch-flexy')
}

function isTheaterPage() {
  return !!getWatchFlexy() && !location.pathname.startsWith('/shorts')
}

function isTheater() {
  const watch = getWatchFlexy()
  return !!(watch && (watch.hasAttribute('theater') || watch.theater))
}

function isFullscreen() {
  const watch = getWatchFlexy()
  return !!(watch?.hasAttribute('fullscreen') || document.fullscreenElement)
}

function watchKey() {
  return new URLSearchParams(location.search).get('v') || location.pathname
}

function requestTheater(enabled) {
  const watch = getWatchFlexy()
  if (watch) {
    watch.dispatchEvent(new CustomEvent('yt-action', {
      bubbles: true,
      composed: true,
      detail: {
        actionName: 'yt-set-theater-mode-enabled',
        optionalAction: false,
        args: [{ enabled }],
        returnValue: [],
      },
    }))
    document.dispatchEvent(new CustomEvent('yt-set-theater-mode-enabled', {
      bubbles: true,
      composed: true,
      detail: { enabled },
    }))
  }

  if (isTheater() === enabled) return true
  if (Date.now() - lastTheaterClickAt < 800) return false

  const button = document.querySelector('.ytp-size-button')
  if (!button) return false
  lastTheaterClickAt = Date.now()
  button.click()
  return isTheater() === enabled
}

function lockTheater() {
  if (!theaterEnabled || !isTheaterPage() || isFullscreen()) return false

  const key = watchKey()
  if (isTheater()) {
    theaterAppliedFor = key
    return true
  }
  if (theaterAppliedFor === key || theaterClickedFor === key) {
    return theaterAppliedFor === key
  }

  const applied = requestTheater(true)
  if (Date.now() - lastTheaterClickAt < 50) theaterClickedFor = key
  if (!applied) return false

  theaterAppliedFor = key
  return true
}

function releaseTheater() {
  window.clearInterval(theaterRetryTimer)
  persistTheaterCookie(false)
  theaterAppliedFor = null
  theaterClickedFor = null
  if (!isTheaterPage() || isFullscreen() || !isTheater()) return
  requestTheater(false)
}

function applyTheaterWithRetries() {
  window.clearInterval(theaterRetryTimer)
  persistTheaterCookie(theaterEnabled)
  if (!theaterEnabled || !isTheaterPage()) return

  if (lockTheater()) return

  const startedAt = Date.now()
  theaterRetryTimer = window.setInterval(() => {
    if (lockTheater() || Date.now() - startedAt >= RETRY_DURATION_MS) {
      window.clearInterval(theaterRetryTimer)
    }
  }, RETRY_INTERVAL_MS)
}

function applyAll() {
  applyQualityWithRetries()
  applyTheaterWithRetries()
}

window.addEventListener('message', (event) => {
  if (
    event.source !== window
    || event.data?.source !== MESSAGE_SOURCE
    || event.data?.type !== 'set-settings'
  ) return

  const nextQuality = !!event.data.forceMaxQuality
  const nextTheater = !!event.data.theater

  qualityEnabled = nextQuality
  if (qualityEnabled) applyQualityWithRetries()
  else releaseQuality()

  theaterEnabled = nextTheater
  if (theaterEnabled) {
    theaterAppliedFor = null
    theaterClickedFor = null
    applyTheaterWithRetries()
  } else {
    releaseTheater()
  }
})

document.addEventListener('yt-navigate-finish', () => {
  theaterAppliedFor = null
  theaterClickedFor = null
  applyAll()
})
document.addEventListener('yt-page-data-updated', applyAll)
