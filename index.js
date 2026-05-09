process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'

/* ==================== IMPORTS ==================== */

import fs, {
  watch,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  watchFile
} from 'fs'

import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import { tmpdir } from 'os'
import { format } from 'util'
import readline from 'readline'

import chalk from 'chalk'
import cfonts from 'cfonts'
import yargs from 'yargs'
import lodash from 'lodash'
import syntaxerror from 'syntax-error'
import NodeCache from 'node-cache'
import pino from 'pino'

import {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  Browsers
} from '@whiskeysockets/baileys'

import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

import {
  makeWASocket,
  protoType,
  serialize
} from './lib/simple.js'

import store from './lib/store.js'

/* ==================== VARIABLES ==================== */

const { chain } = lodash
const PORT = process.env.PORT || 3000

global.__filename = function filename(pathURL = import.meta.url) {
  return fileURLToPath(pathURL)
}

global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL))
}

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

const __dirname = global.__dirname(import.meta.url)

global.timestamp = {
  start: new Date
}

global.opts = new Object(
  yargs(process.argv.slice(2))
    .exitProcess(false)
    .parse()
)

global.prefix = /^[#!./]/i

/* ==================== DATABASE ==================== */

global.db = new Low(
  new JSONFile('./database.json'),
  {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {}
  }
)

global.loadDatabase = async function loadDatabase() {
  await global.db.read()
  global.db.data ||= {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {}
  }

  global.db.chain = chain(global.db.data)
}

await loadDatabase()

setInterval(async () => {
  if (global.db.data) {
    await global.db.write()
  }
}, 30000)

/* ==================== TMP ==================== */

if (!existsSync('./tmp')) {
  mkdirSync('./tmp')
}

/* ==================== LOGO ==================== */

console.clear()

cfonts.say('GUERRA', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'yellow']
})

cfonts.say('BOT MD V2', {
  font: 'console',
  align: 'center',
  colors: ['cyan']
})

console.log(
  chalk.yellowBright(`
╔════════════════════════════╗
║      👑 GUERRA BOT 👑      ║
╚════════════════════════════╝
`)
)

/* ==================== BAILEYS ==================== */

protoType()
serialize()

const sessionFolder = global.sessions || 'sessions'

if (!existsSync(`./${sessionFolder}`)) {
  mkdirSync(`./${sessionFolder}`, { recursive: true })
}

const {
  state,
  saveCreds
} = await useMultiFileAuthState(`./${sessionFolder}`)

const msgRetryCounterCache = new NodeCache()

const { version } = await fetchLatestBaileysVersion()

const connectionOptions = {
  logger: pino({
    level: 'silent'
  }),

  printQRInTerminal: !process.argv.includes('code'),

  browser: Browsers.macOS('Desktop'),

  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      pino({ level: 'silent' })
    )
  },

  markOnlineOnConnect: true,

  generateHighQualityLinkPreview: true,

  syncFullHistory: false,

  version,

  defaultQueryTimeoutMs: 0,

  msgRetryCounterCache,

  getMessage: async (key) => {
    try {
      const jid = jidNormalizedUser(key.remoteJid)
      const msg = await store.loadMessage(jid, key.id)
      return msg?.message || ''
    } catch {
      return ''
    }
  }
}

/* ==================== CONEXIÓN ==================== */

global.conn = makeWASocket(connectionOptions)

conn.isInit = false
conn.well = false

console.log(
  chalk.greenBright('✓ Conectando GUERRA BOT...\n')
)

/* ==================== PAIRING CODE ==================== */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (text) => {
  return new Promise((resolve) => rl.question(text, resolve))
}

async function requestPairingCode() {
  if (
    process.argv.includes('code') &&
    !conn.authState?.creds?.registered
  ) {
    let phoneNumber = await question(
      chalk.cyanBright(
        '📱 Ingresa tu número de WhatsApp:\n➜ '
      )
    )

    phoneNumber = phoneNumber.replace(/\D/g, '')

    if (!phoneNumber) {
      console.log(chalk.redBright('Número inválido'))
      process.exit(0)
    }

    setTimeout(async () => {
      let code = await conn.requestPairingCode(phoneNumber)

      code = code?.match(/.{1,4}/g)?.join('-')

      console.log(
        chalk.black(
          chalk.bgGreenBright(
            `✔ Código de Vinculación: ${code}`
          )
        )
      )
    }, 3000)
  }
}

await requestPairingCode()

/* ==================== HANDLER ==================== */

let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(
      `./handler.js?update=${Date.now()}`
    )

    if (Object.keys(Handler || {}).length) {
      handler = Handler
    }
  } catch (e) {
    console.error(e)
  }

  if (restartConn) {
    try {
      conn.ws.close()
    } catch {}

    conn.ev.removeAllListeners()

    global.conn = makeWASocket(connectionOptions)

    isInit = true
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.handler = handler.handler.bind(global.conn)

  conn.connectionUpdate = connectionUpdate.bind(global.conn)

  conn.credsUpdate = saveCreds.bind(global.conn)

  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)

  isInit = false

  return true
}

/* ==================== CONEXIÓN UPDATE ==================== */

async function connectionUpdate(update) {
  const {
    connection,
    lastDisconnect,
    isNewLogin
  } = update

  if (isNewLogin) {
    conn.isInit = true
  }

  const code =
    lastDisconnect?.error?.output?.statusCode

  if (
    code &&
    code !== DisconnectReason.loggedOut &&
    conn?.ws?.socket == null
  ) {
    await global.reloadHandler(true)
  }

  if (connection === 'open') {
    console.log(
      chalk.greenBright(`
╭─────────────────────╮
│  👑 BOT CONECTADO 👑 │
╰─────────────────────╯
`)
    )

    console.log(
      chalk.cyanBright(
        `➜ Usuario: ${conn.user?.name || 'GUERRA BOT'}`
      )
    )

    console.log(
      chalk.yellowBright(
        `➜ Plataforma: WhatsApp Multi Device`
      )
    )
  }

  if (connection === 'close') {
    let reason = new Error(
      lastDisconnect?.error
    )?.message

    console.log(
      chalk.redBright(
        `⚠ Conexión cerrada: ${reason}`
      )
    )

    if (
      code === DisconnectReason.connectionClosed ||
      code === DisconnectReason.connectionLost ||
      code === DisconnectReason.restartRequired ||
      code === DisconnectReason.timedOut
    ) {
      console.log(
        chalk.yellowBright(
          '♻ Reconectando GUERRA BOT...'
        )
      )

      await global.reloadHandler(true)
    }

    if (code === DisconnectReason.loggedOut) {
      console.log(
        chalk.redBright(
          '❌ Sesión cerrada, elimina la carpeta sessions y vuelve a escanear.'
        )
      )
    }
  }
}

/* ==================== PLUGINS ==================== */

const pluginFolder = global.__dirname(
  join(__dirname, './plugins')
)

const pluginFilter = (filename) =>
  /\.js$/i.test(filename)

global.plugins = {}

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(
        join(pluginFolder, filename)
      )

      const module = await import(file)

      global.plugins[filename] =
        module.default || module

    } catch (e) {
      console.error(e)
      delete global.plugins[filename]
    }
  }
}

await filesInit()

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(
      join(pluginFolder, filename),
      true
    )

    if (filename in global.plugins) {
      console.log(
        chalk.yellowBright(
          `🔄 Plugin actualizado → ${filename}`
        )
      )
    } else {
      console.log(
        chalk.greenBright(
          `✨ Nuevo plugin → ${filename}`
        )
      )
    }

    const err = syntaxerror(
      readFileSync(dir),
      filename,
      {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
      }
    )

    if (err) {
      console.error(
        `❌ Error de sintaxis en ${filename}\n${format(err)}`
      )
    } else {
      try {
        const module = await import(
          `${global.__filename(dir)}?update=${Date.now()}`
        )

        global.plugins[filename] =
          module.default || module

      } catch (e) {
        console.error(e)
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(
            ([a], [b]) => a.localeCompare(b)
          )
        )
      }
    }
  }
}

Object.freeze(global.reload)

watch(pluginFolder, global.reload)

/* ==================== LIMPIEZA TMP ==================== */

function clearTmp() {
  const tmp = join(__dirname, './tmp')

  const files = readdirSync(tmp)

  for (const file of files) {
    unlinkSync(join(tmp, file))
  }
}

setInterval(() => {
  clearTmp()

  console.log(
    chalk.cyanBright(
      '🧹 Archivos temporales eliminados.'
    )
  )
}, 1000 * 60 * 5)

/* ==================== QUICK TEST ==================== */

async function _quickTest() {
  const support = {
    ffmpeg: true,
    ffprobe: true,
    convert: true
  }

  global.support = support

  Object.freeze(global.support)
}

_quickTest().catch(console.error)

/* ==================== RELOAD ==================== */

await global.reloadHandler()

/* ==================== ERROR ==================== */

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

/* ==================== WATCH CONFIG ==================== */

const configFile = global.__filename('./config.js')

watchFile(configFile, () => {
  console.log(
    chalk.redBright('🔄 Configuración actualizada.')
  )
})
