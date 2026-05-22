/* =========================================
   GUERRA BOT MD — ULTRA CORE
   Powered by Kevin Guerra
========================================= */

import './config.js'

import fs, {
  existsSync,
  mkdirSync,
  watch,
  promises as fsP
} from 'fs'

import path, {
  join,
  basename
} from 'path'

import chalk from 'chalk'
import pino from 'pino'
import cfonts from 'cfonts'
import readline from 'readline'
import mongoose from 'mongoose'
import NodeCache from 'node-cache'

import {
  Worker
} from 'worker_threads'

import {
  Boom
} from '@hapi/boom'

import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys'

import useSQLiteAuthState from './lib/auth.js'
import { database, User } from './lib/db.js'
import { smsg } from './lib/serializer.js'

/* =========================================
   GLOBAL
========================================= */

global.BOT = {
  name: 'GUERRA BOT MD',
  owner: 'Kevin Guerra',
  version: '8.0.0',
  prefix: '.',
  mode: 'PUBLIC'
}

global.plugins = new Map()
global.aliases = new Map()
global.conns = new Map()
global.userCache = new Map()

/* =========================================
   CACHE
========================================= */

global.commandCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false
})

/* =========================================
   DATABASE
========================================= */

const MONGO_URI =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority'

/* =========================================
   FOLDERS
========================================= */

const folders = [
  './sessions',
  './tmp',
  './plugins',
  './lib'
]

for (const folder of folders) {
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true })
  }
}

/* =========================================
   LOGGER
========================================= */

const logger = pino({
  level: 'silent'
})

/* =========================================
   FIX ERRORS
========================================= */

process.removeAllListeners('warning')

process.on('uncaughtException', (err) => {

  const msg = err?.message || ''

  if (
    msg.includes('Connection Closed') ||
    msg.includes('Bad MAC') ||
    msg.includes('timed out') ||
    msg.includes('rate-overlimit') ||
    msg.includes('decrypt')
  ) return

  console.log(chalk.redBright('[ ERROR ]'), err)

})

process.on('unhandledRejection', (err) => {

  const msg = String(err?.message || err || '')

  if (
    msg.includes('Connection Closed') ||
    msg.includes('Bad MAC') ||
    msg.includes('timed out') ||
    msg.includes('rate-overlimit') ||
    msg.includes('decrypt')
  ) return

  console.log(chalk.redBright('[ PROMISE ]'), err)

})

/* =========================================
   TERMINAL UI
========================================= */

console.clear()

cfonts.say('GUERRA BOT', {
  font: 'chrome',
  align: 'center',
  gradient: ['cyan', 'blue']
})

console.log(chalk.cyanBright(`
╔════════════════════════════════════╗
║         GUERRA BOT MD             ║
╠════════════════════════════════════╣
║ OWNER   : ${global.BOT.owner}
║ VERSION : ${global.BOT.version}
║ MODE    : ${global.BOT.mode}
║ PREFIX  : ${global.BOT.prefix}
╚════════════════════════════════════╝
`))

/* =========================================
   DATABASE CONNECT
========================================= */

try {

  await database.connect(MONGO_URI)

  global.db = mongoose.connection.db
  global.User = User

  console.log(
    chalk.greenBright('[ ✓ ] DATABASE CONNECTED')
  )

} catch (err) {

  console.log(
    chalk.redBright('[ X ] DATABASE ERROR')
  )

  console.log(err)

}

/* =========================================
   AUTH
========================================= */

const sessionFile = './sessions/main.sqlite'

const {
  state,
  saveCreds
} = useSQLiteAuthState(sessionFile)

/* =========================================
   VERSION
========================================= */

const {
  version
} = await fetchLatestBaileysVersion()

/* =========================================
   CONNECTION OPTIONS
========================================= */

const msgRetryCounterCache = new NodeCache()

const connectionOptions = {

  version,

  logger,

  printQRInTerminal: false,

  browser: Browsers.macOS('Safari'),

  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      logger
    )
  },

  markOnlineOnConnect: true,

  syncFullHistory: false,

  connectTimeoutMs: 60000,

  defaultQueryTimeoutMs: 60000,

  keepAliveIntervalMs: 10000,

  msgRetryCounterCache

}

/* =========================================
   START CONNECTION
========================================= */

global.conn = makeWASocket(connectionOptions)

global.conns.set('main', global.conn)

/* =========================================
   PAIR CODE
========================================= */

if (!state.creds.registered) {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const question = (text) =>
    new Promise((resolve) =>
      rl.question(text, resolve)
    )

  let phoneNumber = await question(
    chalk.yellowBright(`
╔════════════════════════════════════╗
║      NÚMERO WHATSAPP              ║
╚════════════════════════════════════╝
➤ `)
  )

  phoneNumber = phoneNumber.replace(/\D/g, '')

  rl.close()

  setTimeout(async () => {

    try {

      const code =
      await global.conn.requestPairingCode(
        phoneNumber
      )

      console.log(
chalk.greenBright(`
╔════════════════════════════════════╗
║       CÓDIGO DE VINCULACIÓN       ║
╠════════════════════════════════════╣
║   ${code.match(/.{1,4}/g).join('-')}
╚════════════════════════════════════╝
`)
      )

    } catch (err) {

      console.log(err)

    }

  }, 3000)

}

/* =========================================
   MESSAGE HANDLER
========================================= */

let messageHandler = null

const loadHandler = async () => {

  try {

    const file =
    path.join(
      process.cwd(),
      'lib/message.js'
    )

    const module =
    await import(
      `file://${file}?update=${Date.now()}`
    )

    messageHandler =
      module.message ||
      module.default?.message ||
      module.default

    console.log(
      chalk.cyanBright('[ SYSTEM ] MESSAGE UPDATED')
    )

  } catch (err) {

    console.log(err)

  }

}

await loadHandler()

watch(
  path.join(
    process.cwd(),
    'lib/message.js'
  ),
  loadHandler
)

/* =========================================
   CONNECTION EVENTS
========================================= */

global.conn.ev.on(
  'connection.update',
  async (update) => {

    const {
      connection,
      lastDisconnect
    } = update

    if (connection === 'open') {

      console.log(chalk.greenBright(`
╔════════════════════════════════════╗
║        WHATSAPP CONNECTED         ║
╚════════════════════════════════════╝
`))

    }

    if (connection === 'close') {

      const reason =
      new Boom(
        lastDisconnect?.error
      )?.output?.statusCode || 0

      if (
        reason === DisconnectReason.loggedOut
      ) {

        console.log(
          chalk.redBright(`
╔════════════════════════════════════╗
║        SESSION EXPIRED            ║
╠════════════════════════════════════╣
║  DELETE SESSION AND RECONNECT     ║
╚════════════════════════════════════╝
`)
        )

      } else {

        console.log(
          chalk.yellowBright(`
[ SYSTEM ] RECONNECTING...
`)
        )

        setTimeout(async () => {

          global.conn =
          makeWASocket(connectionOptions)

        }, 5000)

      }

    }

  }
)

/* =========================================
   MESSAGE EVENTS
========================================= */

global.conn.ev.on(
  'messages.upsert',
  async (chatUpdate) => {

    try {

      const msg =
      chatUpdate.messages?.[0]

      if (!msg?.message) return

      const m =
      await smsg(
        global.conn,
        msg
      )

      if (messageHandler) {

        await messageHandler.call(
          global.conn,
          m,
          chatUpdate
        )

      }

    } catch (err) {

      if (
        !String(err)
        .includes('decrypt')
      ) {
        console.log(err)
      }

    }

  }
)

/* =========================================
   SAVE CREDS
========================================= */

global.conn.ev.on(
  'creds.update',
  saveCreds
)

/* =========================================
   WORKERS
========================================= */

global.workerMedia =
new Worker(
  new URL(
    './lib/workers/mediaWorker.js',
    import.meta.url
  )
)

/* =========================================
   PLUGINS
========================================= */

async function readPlugins(folder) {

  const files =
  await fsP.readdir(folder)

  for (const filename of files) {

    const file =
    join(folder, filename)

    const stat =
    await fsP.stat(file)

    if (stat.isDirectory()) {

      await readPlugins(file)

    } else if (/\.js$/.test(filename)) {

      try {

        const module =
        await import(
          `file://${file}?update=${Date.now()}`
        )

        const plugin =
        module.default || module

        const name =
        plugin.name ||
        basename(filename, '.js')

        global.plugins.set(
          name,
          plugin
        )

        if (plugin.alias) {

          const aliases =
          Array.isArray(plugin.alias)
          ? plugin.alias
          : [plugin.alias]

          for (const alias of aliases) {
            global.aliases.set(
              alias,
              name
            )
          }

        }

      } catch (err) {

        console.log(err)

      }

    }

  }

}

await readPlugins(
  join(
    process.cwd(),
    './plugins'
  )
)

/* =========================================
   FINAL
========================================= */

console.log(chalk.magentaBright(`
╔════════════════════════════════════╗
║        SYSTEM INITIALIZED         ║
╚════════════════════════════════════╝
`))
