import { Worker } from 'worker_threads'
import './config.js'

import mongoose from 'mongoose'
import { database, User } from './lib/db.js'

import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import path, { join, basename } from 'path'

import fs, {
    existsSync,
    mkdirSync,
    promises as fsP
} from 'fs'

import chalk from 'chalk'
import pino from 'pino'
import yargs from 'yargs'
import { Boom } from '@hapi/boom'
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

const maskLogs = (chunk, encoding, callback, originalWrite) => {
    const msg = chunk?.toString?.() || ''

    if (
        msg.includes('Closing session') ||
        msg.includes('Removing old closed session') ||
        msg.includes('Bad MAC') ||
        msg.includes('Failed to decrypt')
    ) {
        if (typeof encoding === 'function') encoding()
        else if (typeof callback === 'function') callback()
        return true
    }

    return originalWrite(chunk, encoding, callback)
}

const _stdout = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk, encoding, callback) =>
    maskLogs(chunk, encoding, callback, _stdout)

const _stderr = process.stderr.write.bind(process.stderr)
process.stderr.write = (chunk, encoding, callback) =>
    maskLogs(chunk, encoding, callback, _stderr)

EventEmitter.defaultMaxListeners = 50

/* =========================
   GLOBALS
========================= */

global.groupCache = cacheManager.cache
global.conns = new Map()
global.subbotConfig = {}
global.userCache = new Map()
global.dirtyUsers = new Set()

global.plugins = new Map()
global.aliases = new Map()

let messageHandlerMain

/* =========================
   HELPERS
========================= */

const sId = (jid = '') => {
    try {
        if (!jid) return jid
        return jid.includes('@')
            ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
            : jid.split(':')[0] + '@s.whatsapp.net'
    } catch {
        return jid
    }
}

global.updateUser = (jid, data = {}) => {
    const current = global.userCache.get(jid) || {}
    const updated = { ...current, ...data, id: jid }
    global.userCache.set(jid, updated)
    global.dirtyUsers.add(jid)
    return updated
}

global.updateSubBotSettings = (botId, data = {}) => {
    const current = global.subbotConfig[botId] || {}
    global.subbotConfig[botId] = { ...current, ...data, botId }
    return global.subbotConfig[botId]
}

/* =========================
   SAVE USERS
========================= */

const saveUsers = async () => {
    try {
        if (global.dirtyUsers.size < 1 || !global.User) return

        const users = Array.from(global.dirtyUsers)
        global.dirtyUsers.clear()

        const ops = users.map(jid => ({
            updateOne: {
                filter: { id: jid },
                update: { $set: global.userCache.get(jid) },
                upsert: true
            }
        }))

        await global.User.bulkWrite(ops, { ordered: false })
    } catch (e) {
        console.error('BulkWrite Error:', e.message)
    }
}

setInterval(saveUsers, 15000)

/* =========================
   ERROR HANDLER
========================= */

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

/* =========================
   LOGGER
========================= */

const silentLogger = pino({ level: 'silent' })

const originalLog = console.log
console.log = (...args) =>
    originalLog.apply(console, [chalk.cyan('┃'), ...args])

const originalError = console.error
console.error = (...args) =>
    originalError.apply(console, [chalk.red('┗'), ...args])

/* =========================
   BANNER
========================= */

console.clear()
cfonts.say('GUERRA BOT', {
    font: 'slick',
    align: 'center',
    colors: ['cyan', 'white'],
    letterSpacing: 1
})

/* =========================
   FOLDERS
========================= */

for (const dir of ['./tmp', './sessions', './lib/workers']) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
}

/* =========================
   DATABASE
========================= */

const dbUrl = process.env.MONGO_DB_URI || ''

if (dbUrl) {
    try {
        await database.connect(dbUrl)

        console.log(chalk.greenBright('DATABASE CONNECTED'))

        global.db = mongoose.connection.db
        global.User = User
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

/* =========================
   PATH HELPERS
========================= */

global.__filename = function (pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix
        ? /file:\/\/\//.test(pathURL)
            ? fileURLToPath(pathURL)
            : pathURL
        : pathToFileURL(pathURL).toString()
}

global.__dirname = function (pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = /^[#!./]/

/* =========================
   SESSION
========================= */

const sessionDir = path.join(process.cwd(), 'sessions')
const sessionFile = path.join(sessionDir, 'main.sqlite')

if (!existsSync(sessionFile)) {
    mkdirSync(sessionDir, { recursive: true })
}

const authState = await useSQLiteAuthState(sessionFile)

const state = authState?.state || {
    creds: {},
    keys: { get: async () => ({}), set: async () => {} }
}

const saveCreds = authState?.saveCreds || (async () => {})

/* =========================
   VERSION
========================= */

const { version } = await fetchLatestBaileysVersion()

const msgRetryCounterCache = new NodeCache({
    stdTTL: 3600,
    checkperiod: 600
})

/* =========================
   WORKERS
========================= */

global.workerMedia = new Worker(new URL('./lib/workers/mediaWorker.js', import.meta.url))
global.workerText = new Worker(new URL('./lib/workers/textWorker.js', import.meta.url))

global.workerMedia.on('error', console.error)
global.workerText.on('error', console.error)

/* =========================
   SOCKET
========================= */

const connectionOptions = {
    version,
    logger: silentLogger,
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, silentLogger)
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
    emitOwnEvents: true,
    getMessage: async () => undefined
}

global.conn = makeWASocket(connectionOptions)
global.conns.set('main', global.conn)

/* =========================
   PAIRING FIX
========================= */

let pairingDone = false

const startPairing = () => {
    const number = (process.env.NUMBER || '').replace(/\D/g, '')

    if (!number) {
        console.log('┃ ⚠️ Falta NUMBER en .env')
        return
    }

    const tryPair = async (attempt = 1) => {
        try {
            const code = await global.conn.requestPairingCode(number)

            console.log(
                '┃ CÓDIGO DE VINCULACIÓN:',
                code?.match(/.{1,4}/g)?.join('-') || code
            )

            pairingDone = true

        } catch (err) {
            console.error('┃ Error pairing:', err?.message || err)

            if (attempt < 5) {
                console.log(`┃ Reintentando (${attempt}/5)...`)
                setTimeout(() => tryPair(attempt + 1), 4000)
            } else {
                console.log('┃ ❌ No se pudo generar el código')
            }
        }
    }

    // IMPORTANTE: delay para que Baileys cargue auth
    setTimeout(() => {
        if (!pairingDone) tryPair()
    }, 5000)
}

startPairing()
/* =========================
   RELOAD
========================= */

global.reload = async (restart) => {
    if (restart) {
        try {
            global.conn?.ws?.close()
        } catch {}

        const newAuth = await useSQLiteAuthState(sessionFile)

        global.conn = makeWASocket({
            ...connectionOptions,
            auth: {
                creds: newAuth.state.creds,
                keys: makeCacheableSignalKeyStore(newAuth.state.keys, silentLogger)
            }
        })

        global.conn.ev.on('creds.update', newAuth.saveCreds)
        global.conns.set('main', global.conn)
    }

    global.conn.ev.removeAllListeners('messages.upsert')
    observeEvents(global.conn)

    global.conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages?.[0]
            if (!msg) return

            const m = await smsg(global.conn, msg)

            if (m?.isMedia) {
                global.workerMedia.postMessage({
                    sock: 'main',
                    m: JSON.parse(JSON.stringify(m)),
                    messages: JSON.parse(JSON.stringify(chatUpdate.messages))
                })
                return
            }

            if (messageHandlerMain && (msg.message || msg.messageStubType)) {
                await messageHandlerMain.call(global.conn, m, chatUpdate)
            }
        } catch (e) {
            if (!e?.message?.includes('decrypt')) console.error(e)
        }
    })

    global.conn.ev.on('creds.update', saveCreds)
}

await global.reload()

/* =========================
   SUB HANDLER
========================= */

global.subHandler = async (...args) => {
    if (messageHandlerMain) {
        return await messageHandlerMain.call(...args)
    }
}
