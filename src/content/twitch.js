import { MESSAGE_SOURCE, TWITCH_DEFAULTS } from '../settings.js'
import { applyMentionsSetting } from './twitch-mentions.js'

function tellPage(settings) {
  window.postMessage({
    source: MESSAGE_SOURCE,
    type: 'set-settings',
    forceMaxQuality: settings.twitchForceMaxQuality,
  })
  applyMentionsSetting(settings.twitchMentionsPanel)
}

function sync() {
  chrome.storage.local.get(TWITCH_DEFAULTS, tellPage)
}

sync()

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && Object.keys(TWITCH_DEFAULTS).some((key) => changes[key])) {
    sync()
  }
})
