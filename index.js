import { Worker } from 'worker_threads'
import './config.js'

import mongoose from 'mongoose'
import { database, User } from './lib/db.js'

import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import path, { join } from 'path'

import fs, { existsSync, mkdirSync, promises as fsP } from 'fs'

import chalk from 'chalk'
import pino from 'pino'
import yargs from 'yargs'
import NodeCache from 'node-cache'
import readline from 'readline'
import cfonts from 'cfonts'

import { smsg } from './lib/serializer.js'
import { EventEmitter } from 'events'
import { cacheManager } from './lib/cache.js'
import useSQLiteAuthState from './lib/auth.js'
import { observeEvents } from './lib/event/detect.js'

const {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = await import('@whiskeysockets/baileys')

/* =========================
   LOG FILTER
========================= */

const maskLogs = (chunk, _, cb, original) => {
  const msg = chunk?.toString?.() || ''
  if (
    msg.includes('Closing session') ||
    msg.includes('Removing old closed session') ||
    msg.includes('Bad MAC') ||
    msg.includes('Failed to decrypt')
  ) return typeof cb === 'function' ? cb() : true

  return original(chunk, _, cb)
}

const _out = process.stdout.write.bind(process.stdout)
process.stdout.write = (c, e, cb) => maskLogs(c, e, cb, _out)

const _err = process.stderr.write.bind(process.stderr)
process.stderr.write = (c, e, cb) => maskLogs(c, e, cb, _err)

EventEmitter.defaultMaxListeners = 50

/* =========================
   GLOBALS
========================= */

global.groupCache = cacheManager.cache
global.conns = new Map()
global.userCache = new Map()
global.dirtyUsers = new Set()

global.plugins = new Map()
global.aliases = new Map()

let messageHandlerMain

/* =========================
   HELPERS
========================= */

const sId = (jid = '') =>
  jid?.includes('@')
    ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
    : jid?.split(':')[0] + '@s.whatsapp.net'

/* =========================
   SAVE USERS
========================= */

setInterval(async () => {
  if (!global.User || global.dirtyUsers.size === 0) return

  const ops = [...global.dirtyUsers].map(jid => ({
    updateOne: {
      filter: { id: jid },
      update: { $set: global.userCache.get(jid) },
      upsert: true
    }
  }))

  global.dirtyUsers.clear()

  try {
    await global.User.bulkWrite(ops, { ordered: false })
  } catch {}
}, 15000)

/* =========================
   LOGGER
========================= */

const logger = pino({ level: 'silent' })

/* =========================
   BANNER
========================= */

console.clear()
cfonts.say('GUERRA BOT', {
  font: 'slick',
  align: 'center',
  colors: ['cyan', 'white']
})

/* =========================
   FOLDERS
========================= */

for (const d of ['./tmp', './sessions', './lib/workers']) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
}

/* =========================
   DB
========================= */

const dbUrl = process.env.MONGO_DB_URI || ''

if (dbUrl) {
  await database.connect(dbUrl)
  global.db = mongoose.connection.db
  global.User = User
}

/* =========================
   PATH HELPERS
========================= */

global.__filename = (p = import.meta.url, rm = platform !== 'win32') =>
  rm ? fileURLToPath(p) : pathToFileURL(p).toString()

global.__dirname = p => path.dirname(global.__filename(p, true))

global.opts = yargs(process.argv.slice(2)).parse()
global.prefix = /^[#!./]/

/* =========================
   SESSION
========================= */

const sessionFile = './sessions/main.sqlite'
const auth = await useSQLiteAuthState(sessionFile)

const state = auth?.state
const saveCreds = auth?.saveCreds || (async () => {})

/* =========================
   VERSION
========================= */

const { version } = await fetchLatestBaileysVersion()

/* =========================
   SOCKET OPTIONS
========================= */

const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  browser: Browsers.macOS('Chrome'),

  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger)
  },

  markOnlineOnConnect: true,
  syncFullHistory: false,

  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 15000,

  getMessage: async () => undefined
}

/* =========================
   CONNECT
========================= */

global.conn = makeWASocket(connectionOptions)
global.conns.set('main', global.conn)

/* =========================
   PAIRING FIX REAL
========================= */

const sleep = ms => new Promise(r => setTimeout(r, ms))

const startPairing = async () => {

  if (state?.creds?.registered) {
    console.log('┃ ✔ Sesión ya registrada')
    return
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ask = t => new Promise(r => rl.question(t, r))

  const number = (await ask('┃ Número: ')).replace(/\D/g, '')
  rl.close()

  if (!number) return console.log('┃ ❌ Número inválido')

  // esperar socket listo
  let t = 0
  while (!global.conn?.user && t < 20) {
    await sleep(1000)
    t++
  }

  if (!global.conn?.user)
    return console.log('┃ ❌ Socket no listo')

  try {
    const code = await global.conn.requestPairingCode(number)

    console.log(
      '┃ CÓDIGO:',
      code?.match(/.{1,4}/g)?.join('-') || code
    )
  } catch (e) {
    console.log('┃ Error pairing:', e?.message)
  }
}

startPairing()

/* =========================
   RELOAD SAFE
========================= */

global.reload = async (restart = false) => {
  if (restart) {
    try { global.conn.ws.close() } catch {}

    const fresh = await useSQLiteAuthState(sessionFile)

    global.conn = makeWASocket({
      ...connectionOptions,
      auth: {
        creds: fresh.state.creds,
        keys: makeCacheableSignalKeyStore(fresh.state.keys, logger)
      }
    })

    global.conn.ev.on('creds.update', fresh.saveCreds)
    global.conns.set('main', global.conn)
  }

  global.conn.ev.removeAllListeners('messages.upsert')
  observeEvents(global.conn)

  global.conn.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages?.[0]
      if (!msg) return

      const data = await smsg(global.conn, msg)

      if (messageHandlerMain) {
        await messageHandlerMain.call(global.conn, data, m)
      }
    } catch {}
  })

  global.conn.ev.on('creds.update', saveCreds)
}

await global.reload()
