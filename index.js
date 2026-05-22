/* =========================================
   GUERRA BOT MD — CORE SYSTEM
   Powered by Kevin Guerra
========================================= */

import './config.js'

import { Worker } from 'worker_threads'
import mongoose from 'mongoose'

import path, { join, basename } from 'path'

import fs, {
    existsSync,
    mkdirSync,
    watch,
    promises as fsP
} from 'fs'

import chalk from 'chalk'
import pino from 'pino'
import yargs from 'yargs'
import readline from 'readline'
import cfonts from 'cfonts'
import NodeCache from 'node-cache'

import { Boom } from '@hapi/boom'

import {
    platform
} from 'process'

import {
    fileURLToPath,
    pathToFileURL
} from 'url'

import {
    EventEmitter
} from 'events'

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
import { cacheManager } from './lib/cache.js'
import { observeEvents } from './lib/event/detect.js'

/* =========================================
   GLOBAL CONFIG
========================================= */

global.BOT = {
    name: 'GUERRA BOT',
    version: '7.1.0',
    owner: 'Kevin Guerra',
    number: '573102286030',
    prefix: '.',
    mode: 'PUBLIC',
    status: 'ONLINE'
}

/* =========================================
   DATABASE
========================================= */

const MONGO_URI =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority'

/* =========================================
   CACHE
========================================= */

global.groupCache = cacheManager.cache
global.userCache = new Map()
global.dirtyUsers = new Set()
global.plugins = new Map()
global.aliases = new Map()
global.conns = new Map()
global.subbotConfig = {}

EventEmitter.defaultMaxListeners = 0

global.commandCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false
})

/* =========================================
   LOGGER
========================================= */

const silentLogger = pino({
    level: 'silent'
})

/* =========================================
   FIX LOGS
========================================= */

process.removeAllListeners('warning')

const maskLogs = (
    chunk,
    encoding,
    callback,
    originalWrite
) => {

    const msg = chunk?.toString?.() || ''

    if (
        msg.includes('Closing session') ||
        msg.includes('Bad MAC') ||
        msg.includes('Removing old closed session') ||
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

/* =========================================
   ERROR HANDLER
========================================= */

process.on('uncaughtException', (err) => {

    const msg = err?.message || ''

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit') ||
        msg.includes('decrypt')
    ) return

    console.error(err)

})

process.on('unhandledRejection', (reason) => {

    const msg = String(
        reason?.message ||
        reason ||
        ''
    )

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit') ||
        msg.includes('decrypt')
    ) return

    console.error(reason)

})

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
        mkdirSync(folder, {
            recursive: true
        })
    }

}

/* =========================================
   TERMINAL UI
========================================= */

console.clear()

cfonts.say(global.BOT.name, {
    font: 'slick',
    align: 'center',
    colors: ['cyan', 'white'],
    letterSpacing: 1
})

console.log(chalk.cyanBright(`
╔══════════════════════════════╗
║        GUERRA BOT MD        ║
╠══════════════════════════════╣
║ OWNER  : ${global.BOT.owner}
║ MODE   : ${global.BOT.mode}
║ STATUS : ${global.BOT.status}
╚══════════════════════════════╝
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

    console.error(err)

}

/* =========================================
   BAILEYS VERSION
========================================= */

const { version } =
await fetchLatestBaileysVersion()

/* =========================================
   AUTH
========================================= */

const sessionFile =
'./sessions/main.sqlite'

const {
    state,
    saveCreds
} = useSQLiteAuthState(sessionFile)

/* =========================================
   SOCKET CONFIG
========================================= */

const msgRetryCounterCache =
new NodeCache({
    stdTTL: 3600
})

const connectionOptions = {

    version,

    logger: silentLogger,

    printQRInTerminal: false,

    browser: Browsers.macOS('Chrome'),

    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
            state.keys,
            silentLogger
        )
    },

    markOnlineOnConnect: true,

    syncFullHistory: false,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 15000,

    msgRetryCounterCache,

    emitOwnEvents: true,

    getMessage: async () => undefined

}

/* =========================================
   CREATE CONNECTION
========================================= */

global.conn =
makeWASocket(connectionOptions)

global.conn.isMain = true

global.conns.set(
    'main',
    global.conn
)

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

    let phoneNumber =
    await question(
chalk.cyanBright(`
┃ NÚMERO WHATSAPP:
┃ `)
    )

    phoneNumber =
    phoneNumber.replace(/\D/g, '')

    rl.close()

    setTimeout(async () => {

        try {

            const code =
            await global.conn
            .requestPairingCode(phoneNumber)

            console.log(
chalk.greenBright(`
╔══════════════════════════════╗
║     CÓDIGO DE VINCULACIÓN    ║
╠══════════════════════════════╣
║ ${code.match(/.{1,4}/g).join('-')}
╚══════════════════════════════╝
`)
            )

        } catch (err) {

            console.error(err)

        }

    }, 3000)

}

/* =========================================
   MESSAGE HANDLER
========================================= */

let messageHandlerMain

const loadHandlers = async () => {

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

        messageHandlerMain =
        module.message ||
        module.default?.message ||
        module.default

    } catch (err) {

        console.error(err)

    }

}

await loadHandlers()

watch(
    path.join(
        process.cwd(),
        'lib/message.js'
    ),
    loadHandlers
)

/* =========================================
   RELOAD SYSTEM
========================================= */

global.reload = async (
    restartConnection
) => {

    if (restartConnection) {

        try {
            global.conn.ws.close()
        } catch {}

        const {
            state: newState,
            saveCreds: newSaveCreds
        } = useSQLiteAuthState(sessionFile)

        global.conn =
        makeWASocket({

            ...connectionOptions,

            auth: {
                creds: newState.creds,
                keys: makeCacheableSignalKeyStore(
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

                if (
                    messageHandlerMain &&
                    (msg.message ||
                    msg.messageStubType)
                ) {

                    await messageHandlerMain.call(
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
                    console.error(err)
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

                    console.log(
                        chalk.redBright(
                            '[ X ] SESSION CLOSED'
                        )
                    )

                    process.exit(1)

                } else {

                    console.log(
                        chalk.yellowBright(
                            '[ ! ] RECONNECTING...'
                        )
                    )

                    setTimeout(async () => {
                        await global.reload(true)
                    }, 5000)

                }

            }

            if (connection === 'open') {

                console.log(chalk.greenBright(`
╔══════════════════════════════╗
║      SYSTEM INITIALIZED      ║
╚══════════════════════════════╝
`))

                console.log(
                    chalk.greenBright(
                        '[ ✓ ] WHATSAPP CONNECTED'
                    )
                )

            }

        }
    )

    global.conn.ev.on(
        'creds.update',
        saveCreds
    )

}

/* =========================================
   START SYSTEM
========================================= */

await global.reload()

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
   PLUGIN SYSTEM
========================================= */

async function readRecursive(folder) {

    const files =
    await fsP.readdir(folder)

    for (const filename of files) {

        const file =
        join(folder, filename)

        const stat =
        await fsP.stat(file)

        if (stat.isDirectory()) {

            await readRecursive(file)

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

                console.error(err)

            }

        }

    }

}

await readRecursive(
    join(
        process.cwd(),
        './plugins'
    )
)

console.log(
chalk.cyanBright(`
[ SYSTEM ] INDEX UPDATED
`)
)
