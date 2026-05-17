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

const maskLogs = (
    chunk,
    encoding,
    callback,
    originalWrite
) => {

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

    return originalWrite(
        chunk,
        encoding,
        callback
    )
}

const _stdout = process.stdout.write.bind(process.stdout)

process.stdout.write = (
    chunk,
    encoding,
    callback
) => maskLogs(
    chunk,
    encoding,
    callback,
    _stdout
)

const _stderr = process.stderr.write.bind(process.stderr)

process.stderr.write = (
    chunk,
    encoding,
    callback
) => maskLogs(
    chunk,
    encoding,
    callback,
    _stderr
)

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

/* =========================
   HELPERS
========================= */

const sId = (jid = '') => {
    if (!jid) return jid

    return jid.includes('@')
        ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        : jid.split(':')[0] + '@s.whatsapp.net'
}

global.updateUser = (jid, data = {}) => {

    const current =
        global.userCache.get(jid) || {}

    const updated = {
        ...current,
        ...data,
        id: jid
    }

    global.userCache.set(jid, updated)
    global.dirtyUsers.add(jid)

    return updated
}

global.updateSubBotSettings = (
    botId,
    data = {}
) => {

    const current =
        global.subbotConfig[botId] || {}

    global.subbotConfig[botId] = {
        ...current,
        ...data,
        botId
    }

    return global.subbotConfig[botId]
}

/* =========================
   SAVE USERS
========================= */

const saveUsers = async () => {

    try {

        if (
            global.dirtyUsers.size < 1 ||
            !global.User
        ) return

        const users =
            Array.from(global.dirtyUsers)

        global.dirtyUsers.clear()

        const ops = users.map(jid => ({
            updateOne: {
                filter: { id: jid },
                update: {
                    $set: global.userCache.get(jid)
                },
                upsert: true
            }
        }))

        await global.User.bulkWrite(
            ops,
            { ordered: false }
        )

    } catch (e) {
        console.error(
            'BulkWrite Error:',
            e.message
        )
    }
}

setInterval(saveUsers, 15000)

process.on('SIGINT', async () => {
    await saveUsers()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await saveUsers()
    process.exit(0)
})

/* =========================
   ERROR HANDLER
========================= */

process.on(
    'uncaughtException',
    console.error
)

process.on(
    'unhandledRejection',
    console.error
)

/* =========================
   LOGGER
========================= */

const silentLogger = pino({
    level: 'silent'
})

const originalLog = console.log

console.log = (...args) =>
    originalLog.apply(console, [
        chalk.cyan('┃'),
        ...args
    ])

const originalError = console.error

console.error = (...args) =>
    originalError.apply(console, [
        chalk.red('┗'),
        ...args
    ])

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

const folders = [
    './tmp',
    './sessions',
    './lib/workers'
]

for (const dir of folders) {

    if (!existsSync(dir)) {
        mkdirSync(dir, {
            recursive: true
        })
    }
}

/* =========================
   DATABASE
========================= */

const dbUrl =
    process.env.MONGO_DB_URI || ''

if (dbUrl) {

    try {

        await database.connect(dbUrl)

        console.log(
            chalk.greenBright(
                'DATABASE CONNECTED'
            )
        )

        global.db =
            mongoose.connection.db

        global.User = User

    } catch (e) {

        console.error(e)

        process.exit(1)
    }
}

/* =========================
   PATH HELPERS
========================= */

global.__filename = function filename(
    pathURL = import.meta.url,
    rmPrefix = platform !== 'win32'
) {

    return rmPrefix
        ? /file:\/\/\//.test(pathURL)
            ? fileURLToPath(pathURL)
            : pathURL
        : pathToFileURL(pathURL).toString()
}

global.__dirname = function dirname(
    pathURL
) {
    return path.dirname(
        global.__filename(pathURL, true)
    )
}

global.opts = new Object(
    yargs(process.argv.slice(2))
        .exitProcess(false)
        .parse()
)

global.prefix = /^[#!./]/

/* =========================
   SESSION
========================= */

const sessionDir = path.join(
    process.cwd(),
    'sessions'
)

const sessionFile = path.join(
    sessionDir,
    'main.sqlite'
)

if (!existsSync(sessionFile)) {
    fs.writeFileSync(sessionFile, '')
}

let authState = null

try {

    authState =
        await useSQLiteAuthState(
            sessionFile
        )

} catch (e) {

    console.error(
        'Auth Error:',
        e.message
    )
}

const state = authState?.state || {
    creds: {},
    keys: {
        get: async () => ({}),
        set: async () => {}
    }
}

const saveCreds =
    authState?.saveCreds ||
    (async () => {})

/* =========================
   VERSION
========================= */

const { version } =
    await fetchLatestBaileysVersion()

const msgRetryCounterCache =
    new NodeCache({
        stdTTL: 3600,
        checkperiod: 600
    })

/* =========================
   WORKERS
========================= */

global.workerMedia = new Worker(
    new URL(
        './lib/workers/mediaWorker.js',
        import.meta.url
    )
)

global.workerText = new Worker(
    new URL(
        './lib/workers/textWorker.js',
        import.meta.url
    )
)

global.workerMedia.on(
    'error',
    console.error
)

global.workerText.on(
    'error',
    console.error
)

/* =========================
   SOCKET OPTIONS
========================= */

const connectionOptions = {

    version,

    logger: silentLogger,

    printQRInTerminal: false,

    browser: Browsers.macOS('Chrome'),

    auth: {
        creds: state.creds,
        keys:
            makeCacheableSignalKeyStore(
                state.keys,
                silentLogger
            )
    },

    markOnlineOnConnect: true,

    syncFullHistory: false,

    msgRetryCounterCache,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 15000,

    emitOwnEvents: true,

    getMessage: async () => undefined,

    patchMessageBeforeSending: (
        message
    ) => {

        const requiresPatch = !!(
            message?.interactiveMessage ||
            message?.templateMessage ||
            message?.listMessage
        )

        if (requiresPatch) {

            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        ...message
                    }
                }
            }
        }

        return message
    }
}

/* =========================
   CONNECT
========================= */

global.conn =
    makeWASocket(connectionOptions)

global.conn.isMain = true

global.conns.set(
    'main',
    global.conn
)

/* =========================
   PAIRING CODE FIX REAL
========================= */

const esperarConexion = () => {
    return new Promise((resolve) => {

        if (global.conn?.ws?.readyState === 1) {
            return resolve(true)
        }

        const handler = (update) => {
            if (update?.connection === 'open') {
                resolve(true)
            }
        }

        global.conn.ev.on('connection.update', handler)
    })
}

if (!state?.creds?.registered) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const question = (text) =>
        new Promise(resolve => rl.question(text, resolve))

    const phoneNumber = await question(
        chalk.cyan('┃ Número: ')
    )

    rl.close()

    const addNumber = phoneNumber.replace(/\D/g, '')

    console.log(
        chalk.yellow('┃ Iniciando conexión con WhatsApp...')
    )

    // 🔥 IMPORTANTE: esperamos que el socket realmente esté listo
    if (global.conn?.ws?.readyState !== 1) {

        await new Promise((resolve) => {
            global.conn.ev.on('connection.update', (u) => {
                if (u.connection === 'open') resolve()
            })
        })
    }

    try {

        const code = await global.conn.requestPairingCode(addNumber)

        console.log(
            chalk.greenBright(
                `CÓDIGO: ${
                    code?.match(/.{1,4}/g)?.join('-') || code
                }`
            )
        )

    } catch (e) {
        console.error('PAIRING ERROR:', e?.output?.payload || e.message)
    }
}

/* =========================
   MESSAGE HANDLER
========================= */

let messageHandlerMain

const loadHandlers = async () => {

    try {

        const PathMain = path.join(
            process.cwd(),
            'lib/message.js'
        )

        const moduleMain =
            await import(
                `file://${PathMain}?update=${Date.now()}`
            )

        messageHandlerMain =
            moduleMain.message ||
            moduleMain.default?.message ||
            moduleMain.default

    } catch (e) {
        console.error(e)
    }
}

await loadHandlers()

fs.watchFile(
    path.join(
        process.cwd(),
        'lib/message.js'
    ),
    async () => {

        console.log(
            chalk.yellow(
                'message.js actualizado'
            )
        )

        await loadHandlers()
    }
)

/* =========================
   RELOAD
========================= */

global.reload = async (
    restartConn
) => {

    if (restartConn) {

        try {
            global.conn?.ws?.close()
        } catch {}

        const newAuth =
            await useSQLiteAuthState(
                sessionFile
            )

        const {
            state: newState,
            saveCreds: newSaveCreds
        } = newAuth

        global.conn =
            makeWASocket({
                ...connectionOptions,

                auth: {
                    creds:
                        newState.creds,

                    keys:
                        makeCacheableSignalKeyStore(
                            newState.keys,
                            silentLogger
                        )
                }
            })

        global.conn.ev.on(
            'creds.update',
            newSaveCreds
        )

        global.conns.set(
            'main',
            global.conn
        )
    }

    global.conn.ev.removeAllListeners(
        'messages.upsert'
    )

    observeEvents(global.conn)

    global.conn.ev.on(
        'messages.upsert',
        async (chatUpdate) => {

            try {

                const msg =
                    chatUpdate.messages?.[0]

                if (!msg) return

                const m =
                    await smsg(
                        global.conn,
                        msg
                    )

                if (m?.isMedia) {

                    global.workerMedia.postMessage({
                        sock: 'main',
                        m: JSON.parse(
                            JSON.stringify(m)
                        ),
                        messages: JSON.parse(
                            JSON.stringify(
                                chatUpdate.messages
                            )
                        )
                    })

                    return
                }

                if (
                    messageHandlerMain &&
                    (
                        msg.message ||
                        msg.messageStubType
                    )
                ) {

                    await messageHandlerMain.call(
                        global.conn,
                        m,
                        chatUpdate
                    )
                }

            } catch (e) {

                if (
                    !e?.message
                        ?.includes('decrypt')
                ) {
                    console.error(e)
                }
            }
        }
    )

    global.conn.ev.removeAllListeners(
        'connection.update'
    )

    global.conn.ev.on(
        'connection.update',
        async (update) => {

            const {
                connection,
                lastDisconnect
            } = update

            if (connection === 'close') {

                const reason =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode || 0

                if (
                    reason ===
                    DisconnectReason.loggedOut
                ) {

                    console.error(
                        'SESIÓN CERRADA'
                    )

                    if (
                        fs.existsSync(
                            sessionFile
                        )
                    ) {
                        fs.unlinkSync(
                            sessionFile
                        )
                    }

                    process.exit(1)

                } else {

                    if (
                        !global.isReloading
                    ) {

                        global.isReloading = true

                        setTimeout(
                            async () => {

                                await global.reload(
                                    true
                                )

                                global.isReloading = false

                            },
                            10000
                        )
                    }
                }
            }

            if (connection === 'open') {

                global.botNumber =
                    sId(
                        global.conn?.user?.id || ''
                    )

                console.log(
                    chalk.greenBright(
                        'STATUS ONLINE'
                    )
                )

                const groups =
                    await global.conn
                        .groupFetchAllParticipating()
                        .catch(() => ({}))

                for (const id in groups) {

                    cacheManager.updateParticipants(
                        id,
                        groups[id].participants
                    )

                    global.groupCache.set(
                        id,
                        groups[id]
                    )
                }

                try {

                    const {
                        loadSubBots
                    } = await import(
                        './lib/serbot.js'
                    )

                    await loadSubBots(
                        global.conn
                    )

                } catch (e) {
                    console.error(e)
                }
            }
        }
    )

    global.conn.ev.on(
        'creds.update',
        saveCreds
    )
}

await global.reload()

/* =========================
   PLUGINS
========================= */

async function readRecursive(
    folder
) {

    const files =
        await fsP.readdir(folder)

    for (const filename of files) {

        const file =
            join(folder, filename)

        const st =
            await fsP.stat(file)

        if (st.isDirectory()) {

            await readRecursive(file)

        } else if (
            /\.js$/.test(filename)
        ) {

            try {

                const module =
                    await import(
                        `file://${file}?update=${Date.now()}`
                    )

                const plugin =
                    module.default || module

                const name =
                    plugin.name ||
                    basename(
                        filename,
                        '.js'
                    )

                global.plugins.set(
                    name,
                    plugin
                )

                if (plugin.alias) {

                    (
                        Array.isArray(
                            plugin.alias
                        )
                            ? plugin.alias
                            : [plugin.alias]
                    ).forEach(a =>
                        global.aliases.set(
                            a,
                            name
                        )
                    )
                }

            } catch (e) {
                console.error(e)
            }
        }
    }
}

global.reloadHandler =
    async function (check) {

        global.plugins.clear()
        global.aliases.clear()

        await readRecursive(
            join(
                process.cwd(),
                './plugins'
            )
        )

        if (check) return true
    }

await readRecursive(
    join(
        process.cwd(),
        './plugins'
    )
)

global.subHandler = async (
    ...args
) => {

    if (messageHandlerMain) {

        return await messageHandlerMain.call(
            ...args
        )
    }
}
