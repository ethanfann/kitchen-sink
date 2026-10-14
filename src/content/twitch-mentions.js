import { MESSAGE_SOURCE } from '../settings.js'

const MAX_ITEMS = 20
const MAX_THREADS = 50
const MOUNT_MS = 1000
const HOST_ID = 'kitchen-sink-mentions-root'
const TIP_ID = 'kitchen-sink-mentions-tip'
const BUTTON_CLASS = 'ks-mentions-btn'

const TAG_ESCAPES = {
  '\\:': ';',
  '\\s': ' ',
  '\\\\': '\\',
  '\\r': '\r',
  '\\n': '\n',
}

const PAGE_STYLES = `
.ks-mentions-wrap {
  display: contents;
}
.ks-mentions-wrap--docked {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  position: fixed;
  z-index: 10000;
}
.ks-mentions-wrap--docked .ks-mentions-btn {
  width: 32px;
  height: 32px;
  margin: 0;
  border-radius: 50%;
  color: #efeff1;
  background: rgb(31 31 35 / 92%);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 12%);
}
.ks-mentions-wrap--docked .ks-mentions-btn:hover,
.ks-mentions-wrap--docked .ks-mentions-btn[aria-pressed="true"] {
  background: rgb(49 49 53);
  color: #fff;
}
.${BUTTON_CLASS} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;
  width: var(--button-size-default, 30px);
  height: var(--button-size-default, 30px);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-rounded, 4px);
  background: transparent;
  color: var(--color-fill-button-icon, var(--color-text-alt-2, #adadb8));
  cursor: pointer;
}
.${BUTTON_CLASS}:hover,
.${BUTTON_CLASS}[aria-pressed="true"] {
  background: var(--color-background-button-text-hover, rgb(255 255 255 / 8%));
  color: var(--color-fill-button-icon-hover, var(--color-text-base, #efeff1));
}
.${BUTTON_CLASS}:focus-visible {
  outline: 2px solid var(--color-text-base, #fff);
  outline-offset: 2px;
}
.${BUTTON_CLASS} svg {
  display: block;
}
.${BUTTON_CLASS}[data-unread="0"] .ks-mentions-badge {
  display: none;
}
.ks-mentions-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #eb0400;
  color: #fff;
  font-size: 10px;
  font-weight: 650;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
}
@keyframes ks-mention-flash {
  from { background-color: rgb(169 112 255 / 38%); }
  to { background-color: transparent; }
}
.ks-mention-flash {
  animation: ks-mention-flash 1.2s ease;
}
@media (prefers-reduced-motion: reduce) {
  .ks-mention-flash { animation: none; background-color: rgb(169 112 255 / 22%); }
}
#kitchen-sink-mentions-tip {
  --ks-tip-bg: var(--color-background-tooltip, light-dark(#000, #fff));
  --ks-caret-x: 50%;
  --ks-caret-size: 6px;
  box-sizing: border-box;
  position: fixed;
  z-index: 10001;
  display: none;
  padding: 4px 8px;
  border-radius: 0.4rem;
  background: var(--ks-tip-bg);
  color: var(--color-text-tooltip, light-dark(#fff, #000));
  font-family: var(--font-base, inherit);
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: normal;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  box-shadow: none;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 28%));
}
#kitchen-sink-mentions-tip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: var(--ks-caret-x);
  border: var(--ks-caret-size) solid transparent;
  border-top-color: var(--ks-tip-bg);
  transform: translateX(-50%);
}
#kitchen-sink-mentions-tip[data-flip="true"]::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: var(--ks-tip-bg);
}
#kitchen-sink-mentions-tip[data-show="true"] {
  display: block;
}
`

const PANEL_STYLES = `
:host {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
}
.panel {
  position: absolute;
  display: none;
  flex-direction: column;
  width: 320px;
  max-height: 420px;
  overflow: hidden;
  pointer-events: auto;
  color: var(--color-text-base, #efeff1);
  background: var(--color-background-base, #18181b);
  border: 1px solid var(--color-border-base, #3a3a3d);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgb(0 0 0 / 45%);
  font-family: Inter, Roobert, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.panel[data-open="true"] {
  display: flex;
}
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 10px 10px 10px 12px;
  border-bottom: 1px solid var(--color-border-base, #3a3a3d);
}
.title {
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.header button {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-alt-2, #adadb8);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.header button:hover {
  background: var(--color-background-interactable-hover, rgb(255 255 255 / 8%));
  color: var(--color-text-base, #efeff1);
}
.header button:focus-visible {
  outline: 2px solid var(--color-text-base, #fff);
  outline-offset: 1px;
}
.list {
  flex: 1 1 auto;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
}
.empty {
  padding: 28px 16px;
  color: var(--color-text-alt-2, #adadb8);
  font-size: 13px;
  line-height: 1.45;
  text-align: center;
}
.item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.item:hover,
.item:focus-visible {
  background: var(--color-background-interactable-hover, rgb(255 255 255 / 8%));
}
.item:focus-visible {
  outline: 2px solid var(--color-text-base, #fff);
  outline-offset: -2px;
}
.item[data-missing="true"] .snippet {
  color: var(--color-text-alt-2, #adadb8);
}
.item[data-deleted="true"] .snippet {
  text-decoration: line-through;
  opacity: 0.7;
}
.top {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  flex: 0 0 auto;
  color: var(--color-text-alt-2, #adadb8);
  font-size: 11px;
}
.snippet {
  color: var(--color-text-base, #efeff1);
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.parent {
  color: var(--color-text-alt-2, #adadb8);
  font-size: 12px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`

let enabled = true
let open = false
let unread = 0
let activeChannel = null
let items = []
let threadIds = []
let button = null
let badge = null
let host = null
let shadow = null
let mountTimer = 0
let tipTimer = 0
let lastPageIrc = 0
let jumping = false

function unescapeTag(value) {
  return value.replace(/\\[:s\\rn]/g, (token) => TAG_ESCAPES[token] || token)
}

function parseIrc(line) {
  if (!line) return null

  let rest = line
  const tags = {}

  if (rest[0] === '@') {
    const space = rest.indexOf(' ')
    if (space === -1) return null
    for (const pair of rest.slice(1, space).split(';')) {
      const eq = pair.indexOf('=')
      if (eq === -1) tags[pair] = ''
      else tags[pair.slice(0, eq)] = unescapeTag(pair.slice(eq + 1))
    }
    rest = rest.slice(space + 1)
  }

  let prefix = ''
  if (rest[0] === ':') {
    const space = rest.indexOf(' ')
    if (space === -1) return null
    prefix = rest.slice(1, space)
    rest = rest.slice(space + 1)
  }

  const space = rest.indexOf(' ')
  const command = space === -1 ? rest : rest.slice(0, space)
  const params = space === -1 ? '' : rest.slice(space + 1)
  if (command !== 'PRIVMSG' && command !== 'CLEARMSG') return null

  let trailing = params
  let middle = ''
  if (params[0] === ':') {
    trailing = params.slice(1)
  } else {
    const trail = params.indexOf(' :')
    if (trail !== -1) {
      middle = params.slice(0, trail)
      trailing = params.slice(trail + 2)
    } else {
      middle = params
      trailing = ''
    }
  }

  const bang = prefix.indexOf('!')
  const login = (bang === -1 ? prefix : prefix.slice(0, bang)).toLowerCase()

  return {
    command,
    tags,
    login,
    channel: middle.replace(/^#/, '').toLowerCase(),
    message: trailing,
  }
}

function readCookie(name) {
  const prefix = `${name}=`
  const row = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  if (!row) return ''
  try {
    return decodeURIComponent(row.slice(prefix.length))
  } catch {
    return row.slice(prefix.length)
  }
}

function currentUser() {
  try {
    const raw = readCookie('twilight-user')
    if (raw) {
      const user = JSON.parse(raw)
      if (user?.login) {
        return {
          login: String(user.login).toLowerCase(),
          displayName: String(user.displayName || user.login),
        }
      }
    }
  } catch {
    // Cookie can be malformed after a partial login.
  }

  const login = readCookie('login')
  if (login) return { login: login.toLowerCase(), displayName: login }
  return null
}

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function mentionedIn(text, user) {
  const names = [user.login, user.displayName].filter(Boolean)
  return names.some((name) => new RegExp(`(^|[^\\w])@${escapeRe(name)}\\b`, 'i').test(text))
}

function rememberThread(id) {
  if (!id) return
  const index = threadIds.indexOf(id)
  if (index !== -1) threadIds.splice(index, 1)
  threadIds.push(id)
  if (threadIds.length > MAX_THREADS) threadIds.shift()
}

function snippet(text, max = 110) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1)}…`
}

function formatTime(ts) {
  const date = new Date(Number(ts) || Date.now())
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function resetChannel(channel) {
  activeChannel = channel
  items = []
  threadIds = []
  unread = 0
  render()
}

function addItem(item) {
  if (items.some((entry) => entry.id === item.id)) return
  items.unshift(item)
  if (items.length > MAX_ITEMS) items.pop()
  if (!open) unread = Math.min(MAX_ITEMS, unread + 1)
  render()
}

function onIrc(line) {
  if (!enabled) return
  const parsed = parseIrc(line)
  if (!parsed) return

  if (parsed.command === 'CLEARMSG') {
    const id = parsed.tags['target-msg-id']
    const item = items.find((entry) => entry.id === id)
    if (item) {
      item.deleted = true
      render()
    }
    return
  }

  if (parsed.channel && parsed.channel !== activeChannel) {
    resetChannel(parsed.channel)
  } else if (!activeChannel) {
    activeChannel = parsed.channel
  }

  const user = currentUser()
  if (!user) return

  const login = parsed.login
  const isSelf = login && login === user.login
  const threadId = parsed.tags['reply-thread-parent-msg-id'] || ''
  const parentLogin = (parsed.tags['reply-parent-user-login'] || '').toLowerCase()
  const replyToMe = parentLogin === user.login
  const mention = mentionedIn(parsed.message, user)

  if (isSelf) {
    if (threadId) rememberThread(threadId)
    return
  }

  let kind = null
  if (replyToMe) kind = 'reply'
  else if (mention) kind = 'mention'
  else if (threadId && threadIds.includes(threadId)) kind = 'thread'
  if (!kind) return

  if (threadId) rememberThread(threadId)

  addItem({
    id: parsed.tags.id || `${parsed.tags['tmi-sent-ts']}-${login}`,
    login,
    displayName: parsed.tags['display-name'] || login,
    color: parsed.tags.color || '',
    message: parsed.message,
    parent: parsed.tags['reply-parent-msg-body'] || '',
    parentName: parsed.tags['reply-parent-display-name'] || '',
    ts: parsed.tags['tmi-sent-ts'] || Date.now(),
    kind,
    deleted: false,
  })
}

function channelFromPath() {
  const parts = location.pathname.split('/').filter(Boolean)
  if (!parts.length) return null
  const skip = new Set([
    'directory', 'search', 'settings', 'p', 'prime', 'downloads', 'jobs',
    'turbo', 'products', 'wallet', 'subscriptions', 'inventory', 'drops',
    'friends', 'messages', 'videos', 'clips', 'community',
  ])
  if (skip.has(parts[0])) return null
  if (parts[0] === 'moderator' || parts[0] === 'popout' || parts[0] === 'embed') {
    return parts[1] && !skip.has(parts[1]) ? parts[1].toLowerCase() : null
  }
  return parts[0].toLowerCase()
}

function isVisible(el) {
  if (!el?.isConnected) return false
  const rect = el.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return false
  if (rect.bottom < 0 || rect.top > window.innerHeight) return false
  if (rect.right < 0 || rect.left > window.innerWidth) return false
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

function chatComposerOpen() {
  return isVisible(document.querySelector('[data-a-target="chat-settings"]'))
}

function chatCollapsed() {
  return Boolean(
    document.querySelector('.right-column--collapsed')
    || document.querySelector('[class*="right-column--collapsed"]')
  )
}

function findCollapsedToggle() {
  const collapsed = document.querySelector('.right-column--collapsed, [class*="right-column--collapsed"]')
  const scope = collapsed || document
  return scope.querySelector('button[data-a-target="right-column__toggle-collapse"]')
    || scope.querySelector('.right-column__toggle-visibility button')
    || [...scope.querySelectorAll('button')].find((el) => (
      /expand chat|show chat/i.test(`${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`)
    ))
    || document.querySelector('button[aria-label="Expand Chat"], button[aria-label="Show Chat"]')
}

function syncBackupIrc() {
  const channel = channelFromPath() || activeChannel
  const pageLive = Date.now() - lastPageIrc < 4000
  const want = enabled && channel && !chatComposerOpen() && !pageLive
  window.postMessage({
    source: MESSAGE_SOURCE,
    type: 'irc-backup',
    action: want ? 'start' : 'stop',
    channel,
  }, '*')
}

function injectPageStyles() {
  if (document.getElementById('kitchen-sink-mentions-css')) return
  const style = document.createElement('style')
  style.id = 'kitchen-sink-mentions-css'
  style.textContent = PAGE_STYLES
  document.documentElement.appendChild(style)
}

function pageRoot() {
  return document.body || document.documentElement
}

function ensureTip() {
  let tip = document.getElementById(TIP_ID)
  if (!tip) {
    tip = document.createElement('div')
    tip.id = TIP_ID
    tip.className = 'ks-mentions-tip'
    tip.setAttribute('role', 'tooltip')
    tip.textContent = 'Mentions'
    pageRoot().appendChild(tip)
  } else if (document.body && tip.parentElement !== document.body) {
    document.body.appendChild(tip)
  }
  return tip
}

function ensureHost() {
  if (host?.isConnected && shadow?.querySelector('.panel')) {
    if (document.body && host.parentElement !== document.body) document.body.appendChild(host)
    return
  }

  document.getElementById(HOST_ID)?.remove()
  host = document.createElement('div')
  host.id = HOST_ID
  shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = PANEL_STYLES
  const panel = document.createElement('div')
  panel.className = 'panel'
  panel.dataset.open = 'false'
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-label', 'Mentions')
  shadow.append(style, panel)
  shadow.addEventListener('click', onShadowClick)
  pageRoot().appendChild(host)
  ensureTip()
}

function findComposerMount() {
  const settings = document.querySelector('[data-a-target="chat-settings"]')
  const send = document.querySelector('[data-a-target="chat-send-button"]')
  const row = document.querySelector('[data-test-selector="chat-input-buttons-container"]')
  if (!isVisible(settings) && !isVisible(send)) return null

  if (settings && isVisible(settings)) {
    let cluster = settings
    let parent = settings.parentElement
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const atRow = (send && parent.contains(send))
        || (row && parent === row)
        || (!send && parent.querySelectorAll('button').length > 1)
      if (atRow) {
        const after = cluster.nextSibling
        if (after && after.parentNode === parent) return { parent, before: after }
        if (send?.parentNode === parent) return { parent, before: send }
        return { parent, before: null }
      }
      cluster = parent
      parent = parent.parentElement
    }
  }

  if (send?.parentElement && isVisible(send)) return { parent: send.parentElement, before: send }

  return null
}

function insideSettingsTooltip() {
  const settings = document.querySelector('[data-a-target="chat-settings"]')
  const send = document.querySelector('[data-a-target="chat-send-button"]')
  if (!settings || !send) return false
  let node = settings.parentElement
  while (node && !node.contains(send)) {
    if (node.contains(button)) return true
    node = node.parentElement
  }
  return false
}

function isDocked() {
  return Boolean(button?.closest('.ks-mentions-wrap--docked'))
}

function isRightOfSettings() {
  const settings = document.querySelector('[data-a-target="chat-settings"]')
  if (!settings || !button) return true
  const settingsRect = settings.getBoundingClientRect()
  const buttonRect = button.getBoundingClientRect()
  return buttonRect.left + 1 >= settingsRect.right
}

function isMountedWell() {
  if (!button?.isConnected) return false
  if (chatComposerOpen()) {
    return !isDocked() && !insideSettingsTooltip() && isRightOfSettings()
  }
  return isDocked()
}

function removeButton() {
  hideTip()
  document.querySelectorAll('.ks-mentions-wrap').forEach((node) => node.remove())
  document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((node) => node.remove())
  button = null
  badge = null
}

function createIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 20 20')
  svg.setAttribute('width', '20')
  svg.setAttribute('height', '20')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('fill', 'currentColor')
  path.setAttribute('d', 'M10 3.25a6.75 6.75 0 1 0 4.18 12.05 1 1 0 1 1 1.24 1.57A8.75 8.75 0 1 1 18.75 10v.7a2.95 2.95 0 0 1-5.48 1.5A4.75 4.75 0 1 1 14.75 10v.7a.75.75 0 0 0 1.5 0V10A6.75 6.75 0 0 0 10 3.25ZM10 6.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z')
  svg.appendChild(path)
  return svg
}

function createButton() {
  const node = document.createElement('button')
  node.type = 'button'
  node.className = BUTTON_CLASS
  node.setAttribute('aria-label', 'Mentions')
  node.setAttribute('aria-describedby', TIP_ID)
  node.setAttribute('aria-pressed', 'false')
  node.setAttribute('aria-expanded', 'false')
  node.dataset.unread = '0'

  badge = document.createElement('span')
  badge.className = 'ks-mentions-badge'
  badge.textContent = '0'
  node.append(createIcon(), badge)

  node.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    hideTip()
    togglePanel()
  })
  node.addEventListener('mouseenter', (event) => {
    event.stopPropagation()
    scheduleTip()
  })
  node.addEventListener('mouseover', (event) => event.stopPropagation())
  node.addEventListener('mouseleave', hideTip)
  node.addEventListener('focus', scheduleTip)
  node.addEventListener('blur', hideTip)
  return node
}

function placeCollapsedButton() {
  const wrap = button?.closest('.ks-mentions-wrap--docked')
  if (!wrap) return
  const toggle = findCollapsedToggle()
  const rect = toggle?.getBoundingClientRect()
  if (rect && rect.width >= 8 && rect.bottom < window.innerHeight) {
    wrap.style.top = `${rect.bottom + 8}px`
    wrap.style.left = `${rect.left + (rect.width - 32) / 2}px`
    wrap.style.right = 'auto'
    return
  }
  wrap.style.top = '56px'
  wrap.style.right = '8px'
  wrap.style.left = 'auto'
}

function mountButton() {
  if (!enabled) return
  syncBackupIrc()

  const onStream = Boolean(channelFromPath() || activeChannel || chatComposerOpen() || chatCollapsed())
  if (!onStream) {
    if (button) removeButton()
    return
  }

  if (isMountedWell()) {
    if (isDocked()) placeCollapsedButton()
    return
  }

  const composer = findComposerMount()
  if (!composer && !chatCollapsed() && !channelFromPath() && !activeChannel) return

  injectPageStyles()
  ensureHost()
  removeButton()
  button = createButton()
  const wrap = document.createElement('div')
  wrap.className = 'ks-mentions-wrap'
  wrap.appendChild(button)

  if (composer) {
    composer.parent.insertBefore(wrap, composer.before)
  } else {
    wrap.classList.add('ks-mentions-wrap--docked')
    document.documentElement.appendChild(wrap)
    placeCollapsedButton()
  }
  render()
}

function hideTip() {
  window.clearTimeout(tipTimer)
  tipTimer = 0
  const tip = document.getElementById(TIP_ID)
  if (tip) tip.dataset.show = 'false'
}

function scheduleTip() {
  window.clearTimeout(tipTimer)
  tipTimer = window.setTimeout(showTip, 200)
}

function showTip() {
  if (open || !button?.isConnected) return
  const tip = ensureTip()
  const rect = button.getBoundingClientRect()
  tip.textContent = 'Mentions'
  tip.removeAttribute('style')
  tip.dataset.show = 'true'
  const width = tip.offsetWidth
  const height = tip.offsetHeight
  const pad = 8
  const caret = 6
  let left = rect.left + rect.width / 2 - width / 2
  if (left + width > window.innerWidth - pad) left = window.innerWidth - width - pad
  if (left < pad) left = pad
  let top = rect.top - height - caret - 2
  if (top < pad) {
    top = rect.bottom + caret + 2
    tip.dataset.flip = 'true'
  } else {
    tip.dataset.flip = 'false'
  }
  top = Math.max(pad, Math.min(top, window.innerHeight - height - pad))
  const caretX = rect.left + rect.width / 2 - left
  const caretMin = caret + 6
  const caretMax = width - caret - 6
  tip.style.setProperty('--ks-caret-x', `${Math.max(caretMin, Math.min(caretMax, caretX))}px`)
  tip.style.left = `${left}px`
  tip.style.right = 'auto'
  tip.style.top = `${top}px`
}

function positionPanel() {
  const panel = shadow?.querySelector('.panel')
  if (!panel || !button?.isConnected) return

  const btnRect = button.getBoundingClientRect()
  const width = 320
  const gap = 8
  const maxHeight = Math.min(420, Math.max(200, window.innerHeight - 96))
  panel.style.width = `${width}px`
  panel.style.maxHeight = `${maxHeight}px`

  if (isDocked()) {
    panel.style.bottom = 'auto'
    panel.style.top = `${Math.max(12, Math.min(btnRect.top, window.innerHeight - 220))}px`
    if (btnRect.left >= width + 16) {
      panel.style.left = 'auto'
      panel.style.right = `${Math.max(8, window.innerWidth - btnRect.left + gap)}px`
    } else {
      panel.style.right = 'auto'
      panel.style.left = `${btnRect.right + gap}px`
    }
    return
  }

  const chat = document.querySelector('section[data-test-selector="chat-room-component-layout"]')
    || document.querySelector('.stream-chat')
    || button
  const chatRect = chat.getBoundingClientRect()

  panel.style.top = 'auto'
  panel.style.left = 'auto'
  panel.style.bottom = `${Math.max(12, window.innerHeight - btnRect.top + gap)}px`

  if (chatRect.left >= width + 16) {
    panel.style.right = `${Math.max(8, window.innerWidth - chatRect.left + gap)}px`
  } else {
    panel.style.right = `${Math.max(8, window.innerWidth - btnRect.right)}px`
  }
}

function headerButton(action, label, ariaLabel) {
  const node = document.createElement('button')
  node.type = 'button'
  node.dataset.act = action
  node.textContent = label
  if (ariaLabel) node.setAttribute('aria-label', ariaLabel)
  return node
}

function renderList() {
  const panel = shadow?.querySelector('.panel')
  if (!panel) return

  const previousList = shadow.querySelector('.list')
  const scrollTop = previousList?.scrollTop || 0

  const header = document.createElement('div')
  header.className = 'header'
  const title = document.createElement('div')
  title.className = 'title'
  title.textContent = 'Mentions'
  header.appendChild(title)
  if (items.length) header.appendChild(headerButton('clear', 'Clear'))
  header.appendChild(headerButton('close', 'Close', 'Close'))

  const list = document.createElement('div')
  list.className = 'list'
  list.setAttribute('role', 'list')

  if (!items.length) {
    const empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = currentUser()
      ? 'Replies, @mentions, and threads you’re in will land here.'
      : 'Sign in to catch replies and @mentions.'
    list.appendChild(empty)
  } else {
    for (const item of items) {
      const row = document.createElement('button')
      row.type = 'button'
      row.className = 'item'
      row.setAttribute('role', 'listitem')
      row.dataset.id = item.id
      if (item.deleted) row.dataset.deleted = 'true'
      row.title = item.message

      const top = document.createElement('div')
      top.className = 'top'
      const name = document.createElement('div')
      name.className = 'name'
      name.textContent = item.displayName
      if (item.color) name.style.color = item.color
      const time = document.createElement('div')
      time.className = 'time'
      time.textContent = formatTime(item.ts)
      top.append(name, time)

      const text = document.createElement('div')
      text.className = 'snippet'
      text.textContent = snippet(item.message)

      row.append(top, text)
      if (item.parent) {
        const parent = document.createElement('div')
        parent.className = 'parent'
        parent.textContent = item.parentName
          ? `${item.parentName}: ${snippet(item.parent, 80)}`
          : snippet(item.parent, 80)
        row.appendChild(parent)
      }
      list.appendChild(row)
    }
  }

  panel.replaceChildren(header, list)
  list.scrollTop = scrollTop
}

function render() {
  if (badge) {
    badge.textContent = unread > 9 ? '9+' : String(unread)
  }
  if (button) {
    button.dataset.unread = String(unread)
    button.setAttribute('aria-pressed', open ? 'true' : 'false')
    button.setAttribute('aria-expanded', open ? 'true' : 'false')
    button.setAttribute('aria-label', unread ? `Mentions, ${unread} unread` : 'Mentions')
  }

  const panel = shadow?.querySelector('.panel')
  if (!panel) return
  panel.dataset.open = open ? 'true' : 'false'
  if (open) {
    renderList()
    positionPanel()
  }
}

function findChatNode(id) {
  const escaped = CSS.escape(id)
  return document.querySelector(`[data-id="${escaped}"]`)
    || document.querySelector(`[data-a-id="${escaped}"]`)
    || document.querySelector(`.chat-line__message[id="${escaped}"]`)
    || document.getElementById(id)
}

function markMissing(id) {
  const row = shadow?.querySelector(`.item[data-id="${CSS.escape(id)}"]`)
  if (!row) return
  row.dataset.missing = 'true'
  const snippetNode = row.querySelector('.snippet')
  if (snippetNode && !snippetNode.dataset.original) {
    snippetNode.dataset.original = snippetNode.textContent
    snippetNode.textContent = 'No longer in chat'
  }
}

function expandChat() {
  const toggle = findCollapsedToggle()
  if (toggle && !chatComposerOpen()) toggle.click()
}

function waitForChat() {
  return new Promise((resolve) => {
    const started = Date.now()
    const tick = () => {
      if (chatComposerOpen()) {
        resolve(true)
        return
      }
      if (Date.now() - started > 3500) {
        resolve(false)
        return
      }
      window.setTimeout(tick, 50)
    }
    tick()
  })
}

function revealChatMessage(id) {
  const node = findChatNode(id)
  if (!node) {
    markMissing(id)
    return
  }
  node.scrollIntoView({ block: 'center', behavior: 'smooth' })
  node.classList.remove('ks-mention-flash')
  void node.offsetWidth
  node.classList.add('ks-mention-flash')
}

async function jumpTo(id) {
  if (jumping) return
  if (!chatComposerOpen()) {
    jumping = true
    expandChat()
    const opened = await waitForChat()
    jumping = false
    mountButton()
    if (!opened) {
      markMissing(id)
      return
    }
  }
  revealChatMessage(id)
}

function openPanel() {
  ensureHost()
  open = true
  unread = 0
  hideTip()
  render()
}

function closePanel() {
  open = false
  render()
}

function togglePanel() {
  if (open) closePanel()
  else openPanel()
}

function onDocumentClick(event) {
  if (!open) return
  const path = event.composedPath()
  if (button && path.includes(button)) return
  const wrap = button?.closest('.ks-mentions-wrap')
  if (wrap && path.includes(wrap)) return
  if (host && path.includes(host)) return
  closePanel()
}

function onKeydown(event) {
  if (event.key === 'Escape' && open) closePanel()
}

function onShadowClick(event) {
  const act = event.target.closest?.('[data-act]')?.dataset.act
  if (act === 'close') {
    closePanel()
    return
  }
  if (act === 'clear') {
    items = []
    unread = 0
    render()
    return
  }
  const row = event.target.closest?.('.item')
  if (row?.dataset.id) jumpTo(row.dataset.id)
}

function onMessage(event) {
  if (event.source !== window || event.data?.source !== MESSAGE_SOURCE) return
  if (event.data?.type === 'irc') {
    if (!event.data.backup) lastPageIrc = Date.now()
    onIrc(event.data.data)
    return
  }
  if (event.data?.type === 'irc-state' && event.data.state === 'closed') {
    lastPageIrc = 0
    syncBackupIrc()
  }
}

export function applyMentionsSetting(value) {
  enabled = !!value
  if (!enabled) {
    open = false
    unread = 0
    items = []
    threadIds = []
    activeChannel = null
    removeButton()
    document.getElementById(TIP_ID)?.remove()
    host?.remove()
    host = null
    shadow = null
    window.clearInterval(mountTimer)
    mountTimer = 0
    window.postMessage({ source: MESSAGE_SOURCE, type: 'irc-backup', action: 'stop' }, '*')
    return
  }

  ensureHost()
  mountButton()
  if (!mountTimer) {
    mountTimer = window.setInterval(() => {
      mountButton()
      if (isDocked()) placeCollapsedButton()
      if (open) positionPanel()
    }, MOUNT_MS)
  }
}

window.addEventListener('message', onMessage)
document.addEventListener('mousedown', onDocumentClick, true)
document.addEventListener('keydown', onKeydown)
window.addEventListener('resize', () => {
  if (isDocked()) placeCollapsedButton()
  if (open) positionPanel()
})
