import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Kitchen Sink',
  version: pkg.version,
  description: 'Small, useful browser tweaks for YouTube, Twitch, and Google.',
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [
    {
      js: ['src/content/lock.iife.js'],
      matches: [
        'https://www.youtube.com/*',
        'https://music.youtube.com/*',
        'https://www.youtube-nocookie.com/*',
      ],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      js: ['src/content/main.js'],
      matches: [
        'https://www.youtube.com/*',
        'https://music.youtube.com/*',
        'https://www.youtube-nocookie.com/*',
      ],
      run_at: 'document_start',
    },
    {
      js: ['src/content/twitch-irc.iife.js'],
      matches: [
        'https://www.twitch.tv/*',
        'https://m.twitch.tv/*',
      ],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      js: ['src/content/twitch-lock.iife.js'],
      matches: [
        'https://www.twitch.tv/*',
        'https://m.twitch.tv/*',
      ],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      js: ['src/content/twitch.js'],
      matches: [
        'https://www.twitch.tv/*',
        'https://m.twitch.tv/*',
      ],
      run_at: 'document_start',
    },
    {
      js: ['src/content/google.js'],
      matches: [
        'https://www.google.com/search*',
        'https://google.com/search*',
      ],
      run_at: 'document_start',
    },
  ],
  permissions: ['storage'],
})
