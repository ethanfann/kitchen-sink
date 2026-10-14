const MESSAGE_SOURCE = 'kitchen-sink-extension'
const NativeWebSocket = window.WebSocket

let backup = null

function isIrcUrl(url) {
  return /irc-ws/i.test(url) || /irc\.chat\.twitch\.tv/i.test(url)
}

function forwardLine(line, backupLine = false) {
  if (!line || (!line.includes('PRIVMSG') && !line.includes('CLEARMSG'))) return
  window.postMessage({
    source: MESSAGE_SOURCE,
    type: 'irc',
    data: line,
    backup: backupLine,
  }, '*')
}

function postState(state) {
  window.postMessage({ source: MESSAGE_SOURCE, type: 'irc-state', state }, '*')
}

function attach(socket, url) {
  if (!isIrcUrl(String(url || ''))) return
  socket.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return
    for (const line of event.data.split('\r\n')) forwardLine(line)
  })
  socket.addEventListener('open', () => postState('open'))
  socket.addEventListener('close', () => postState('closed'))
}

function stopBackup() {
  const current = backup
  backup = null
  try {
    current?.ws.close()
  } catch {
    // Already closing.
  }
}

function startBackup(channel) {
  const login = String(channel || '').replace(/^#/, '').toLowerCase()
  if (!login) return
  if (backup?.channel === login && backup.ws.readyState <= 1) return

  stopBackup()
  const ws = new NativeWebSocket('wss://irc-ws.chat.twitch.tv:443')
  backup = { channel: login, ws }

  ws.addEventListener('open', () => {
    if (backup?.ws !== ws) return
    const nick = `justinfan${10000 + Math.floor(Math.random() * 80000)}`
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
    ws.send('PASS SCHMOOPIIE')
    ws.send(`NICK ${nick}`)
    ws.send(`JOIN #${login}`)
  })

  ws.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return
    for (const line of event.data.split('\r\n')) {
      if (!line) continue
      if (line.startsWith('PING')) {
        ws.send(`PONG${line.slice(4)}`)
        continue
      }
      forwardLine(line, true)
    }
  })

  ws.addEventListener('close', () => {
    if (backup?.ws === ws) backup = null
  })
}

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== MESSAGE_SOURCE) return
  if (event.data?.type !== 'irc-backup') return
  if (event.data.action === 'start') startBackup(event.data.channel)
  else stopBackup()
})

class KitchenSinkWebSocket extends NativeWebSocket {
  constructor(url, protocols) {
    super(url, protocols)
    try {
      attach(this, url)
    } catch {
      // Chat still works if the hook fails.
    }
  }
}

KitchenSinkWebSocket.CONNECTING = NativeWebSocket.CONNECTING
KitchenSinkWebSocket.OPEN = NativeWebSocket.OPEN
KitchenSinkWebSocket.CLOSING = NativeWebSocket.CLOSING
KitchenSinkWebSocket.CLOSED = NativeWebSocket.CLOSED

window.WebSocket = KitchenSinkWebSocket
