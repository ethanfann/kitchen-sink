# Kitchen Sink

A small Chrome extension for the browser tweaks I want on YouTube, Twitch, and Google Search. Built with vanilla JavaScript, CSS, Vite, and CRXJS.

## Features

Every feature has its own switch in the extension popup. All switches start enabled, and settings are saved locally in your browser profile.

| Site | Feature | Behavior |
| --- | --- | --- |
| YouTube | Maximum quality | Requests the highest resolution the player makes available. |
| YouTube | Theater mode | Opens watch pages with the large player automatically. |
| Twitch | Maximum quality | Requests the highest available stream quality. |
| Twitch | Mentions panel | Keeps recent replies, @mentions, and followed reply-thread messages in a small panel. |
| Google Search | Blur AI Overviews | Blurs recognized AI answers while leaving ordinary results readable, including links above the overview. |

The blur preserves the page layout. Turn it off in the popup to read an overview; hovering does not reveal it.

## Install from source

Requires Chrome, Node.js 22.12 or newer, and npm.

```sh
git clone https://github.com/ethanfann/kitchen-sink.git
cd kitchen-sink
npm ci
npm run build
```

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this project's **`dist/`** directory.
4. Pin Kitchen Sink if you want quick access to its switches.
5. Refresh any YouTube, Twitch, or Google tabs that were already open.

To update an unpacked installation, pull the latest source, run `npm ci` and `npm run build`, reload the extension at `chrome://extensions`, and refresh affected tabs.

Builds also produce `release/crx-kitchen-sink-<version>.zip`. This is an unpacked-extension archive, not a signed CRX or a Chrome Web Store release.

## Development and tests

```sh
npm run dev
```

Load `dist/` as above. Reload the extension after manifest changes. Refresh site tabs after changing MAIN-world player or IRC scripts; do not rely on hot reload for those scripts.

```sh
# Only needed if /usr/bin/chromium is not available:
npx playwright install chromium

npm test
```

The test command builds the extension, loads it into a temporary Chromium profile, and checks Google blur behavior against controlled HTML fixtures. It covers inline and top-of-page overviews, surrounding ordinary links, toggling, persistence, and dynamically inserted content. It does not verify Google's current live markup. YouTube and Twitch integrations currently require manual checks.

Main source locations:

- `src/settings.js`: feature defaults and shared message names.
- `src/popup/`: settings popup.
- `src/content/`: site-specific content scripts. `*.iife.js` scripts run in the page's MAIN world to access player and WebSocket APIs.
- `manifest.config.js`: supported URLs and extension permissions.
- `tests/`: browser regression test and fixtures.

## Permissions and privacy

- The only declared Chrome API permission is `storage`. Content scripts are restricted to the YouTube, Twitch, and Google Search hosts listed in the manifest; there is no `<all_urls>` access.
- No analytics, telemetry, or extension-operated backend. Settings use `chrome.storage.local`, not Chrome Sync.
- Theater mode updates YouTube's `wide` preference cookie. Twitch quality updates its `video-quality` site preference.
- The mentions panel reads your Twitch login/display name from the site's cookies and processes chat messages in the page. It keeps up to 20 entries in memory, with no persistent chat history. It requires a signed-in Twitch user.
- When needed, mentions opens an anonymous, read-only connection directly to Twitch IRC. Chat data is not sent to an extension-operated service, but page-world messaging is not isolated from scripts on the Twitch page.

## Limitations

- This is a collection of best-effort tweaks, not a supported integration with any of these sites. Private player APIs, React internals, and page selectors can change without notice.
- Maximum quality cannot make unavailable resolutions appear or bypass Premium/subscriber access. Higher quality can increase bandwidth and CPU/GPU usage.
- Google matching currently runs on `google.com/search` and `www.google.com/search`. It targets recognized AI Overview containers, not the separate AI Mode experience. Heading-based matching supports English and German; layout and language coverage is not comprehensive.
- Mentions only includes messages observed while the page is open. It cannot fetch chat history or scroll to messages Twitch has already removed from the page. Some controls use English labels.
- Chrome is the target browser. Other browsers are not tested.

## Contributing

Bug reports and focused pull requests are welcome. For a site-layout bug, include the affected URL or query, Chrome version, enabled switches, and a screenshot or minimal HTML reproduction with private information removed. Run `npm test` and manually check any site integration you change.

## License and credits

Kitchen Sink's code is [MIT licensed](LICENSE), copyright 2026 Ethan Fann. The package remains `private` to prevent accidental npm publication; that does not restrict this source license.

The starter icon, detection references, and their upstream terms are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Both notice files are included in built extension archives. Development dependencies retain their respective licenses.

Not affiliated with or endorsed by Google, YouTube, or Twitch.
