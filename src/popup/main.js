import './style.css'
import { DEFAULTS } from '../settings.js'

const toggles = [
  { id: 'youtube-max-quality', key: 'forceMaxQuality' },
  { id: 'youtube-theater', key: 'youtubeTheater' },
  { id: 'twitch-max-quality', key: 'twitchForceMaxQuality' },
  { id: 'twitch-mentions', key: 'twitchMentionsPanel' },
  { id: 'google-blur-ai-overviews', key: 'googleBlurAiOverviews' },
]

function bindToggle({ id, key }) {
  const toggle = document.querySelector(`#${id}`)

  chrome.storage.local.get({ [key]: DEFAULTS[key] }, (settings) => {
    toggle.checked = settings[key]
  })

  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [key]: toggle.checked })
  })
}

toggles.forEach(bindToggle)
