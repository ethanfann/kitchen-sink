import { MESSAGE_SOURCE, YOUTUBE_DEFAULTS } from '../settings.js'

function tellPage(settings) {
  document.cookie = `wide=${settings.youtubeTheater ? 1 : 0}; path=/; max-age=31536000`
  window.postMessage({
    source: MESSAGE_SOURCE,
    type: 'set-settings',
    forceMaxQuality: settings.forceMaxQuality,
    theater: settings.youtubeTheater,
  })
}

function sync() {
  chrome.storage.local.get(YOUTUBE_DEFAULTS, tellPage)
}

sync()

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.forceMaxQuality || changes.youtubeTheater)) {
    sync()
  }
})
