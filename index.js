/* =========================================
   ⚔️ GUERRA BOT MD — FINAL STABLE CORE
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

import readline from 'readline'

import chalk from 'chalk'
import gradient from 'gradient-string'
import pino from 'pino'
import cfonts from 'cfonts'
import mongoose from 'mongoose'
import NodeCache from 'node-cache'

import { Worker } from 'worker_threads'

import {
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'

import {
    pathToFileURL
} from 'url'

import useSQLiteAuthState from './lib/auth.js'
import { database, User } from './lib/db.js'
import { smsg } from './lib/serializer.js'

/* =========================================
   ⚙️ BOT SETTINGS
========================================= */

global.BOT = {
    name: 'GUERRA BOT MD',
    owner: 'Kevin Guerra',
    version: '11.0.0',
    prefix: '.',
    mode: 'PUBLIC'
}

/* =========================================
   🎨 PREMIUM COLORS
========================================= */

const premium = gradient([
    '#00F5FF',
    '#00A2FF',
    '#7B2CFF',
    '#FF00EA'
])

/* =========================================
   📦 DATABASE
========================================= */

const MONGO_URI =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority'

/* =========================================
   📁 CREATE FOLDERS
========================================= */

const folders = [
    './sessions',
    './tmp',
    './plugins',
    './handlers',
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
   🧠 GLOBALS
========================================= */

global.plugins = global.plugins || new Map()
global.aliases = global.aliases || new Map()

global.handlers = global.handlers || []

global.commandCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false
})

/* =========================================
   🔇 LOGGER
========================================= */

const logger = pino({
    level: 'silent'
})

/* =========================================
   🛡️ ERROR HANDLER
========================================= */

process.removeAllListeners('warning')

process.on('uncaughtException', (err) => {

    const msg = String(err)

    if (
        msg.includes('Connection Closed') ||
        msg.includes('Timed Out') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error(
        chalk.redBright('[ ERROR ]'),
        err
    )

})

process.on('unhandledRejection', (reason) => {

    const msg = String(reason)

    if (
        msg.includes('Connection Closed') ||
        msg.includes('Timed Out') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error(
        chalk.redBright('[ REJECTION ]'),
        reason
    )

})

/* =========================================
   🎨 TERMINAL UI
========================================= */

console.clear()

cfonts.say('GUERRA BOT', {
    font: 'block',
    align: 'center',
    gradient: ['#00F5FF', '#7B2CFF']
})

console.log(
premium.multiline(`
╔══════════════════════════════════════╗
║         ⚔️ GUERRA BOT MD ⚔️         ║
╠══════════════════════════════════════╣
║ OWNER   : ${global.BOT.owner}
║ VERSION : ${global.BOT.version}
║ MODE    : ${global.BOT.mode}
║ PREFIX  : ${global.BOT.prefix}
╚══════════════════════════════════════╝
`)
)

/* =========================================
   ☁️ DATABASE
========================================= */

try {

    await database.connect(MONGO_URI)

    global.db = mongoose.connection.db
    global.User = User

    console.log(
        chalk.hex('#00FFB7')(
            '[ ✓ ] DATABASE CONNECTED'
        )
    )

} catch (err) {

    console.log(
        chalk.redBright(
            '[ X ] DATABASE ERROR'
        )
    )

    console.error(err)

}

/* =========================================
   📲 AUTH
========================================= */

const sessionFile =
'./sessions/main.sqlite'

const {
    state,
    saveCreds
} = useSQLiteAuthState(sessionFile)

/* =========================================
   🔥 BAILEYS VERSION
========================================= */

const {
    version
} = await fetchLatestBaileysVersion()

/* =========================================
   ⚡ CONNECTION OPTIONS
========================================= */

const msgRetryCounterCache =
new NodeCache()

const connectionOptions = {

    version,

    logger,

    printQRInTerminal: false,

    browser: Browsers.macOS('Chrome'),

    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
            state.keys,
            logger
        )
    },

    markOnlineOnConnect: false,

    syncFullHistory: false,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 15000,

    msgRetryCounterCache
}

/* =========================================
   🔄 RECONNECT CONTROL
========================================= */

let isStarting = false
let reconnectAttempts = 0
const MAX_RECONNECT = 10

/* =========================================
   📩 MESSAGE HANDLER
========================================= */

async function loadHandler() {

    try {

        const file =
        path.resolve('./lib/message.js')

        const module =
        await import(
            pathToFileURL(file).href +
            `?update=${Date.now()}`
        )

        global.messageHandler =
        module.message ||
        module.default?.message ||
        module.default

        console.log(
            chalk.hex('#00FFD5')(
                '[ ✓ ] MESSAGE HANDLER LOADED'
            )
        )

    } catch (err) {

        console.error(err)

    }

}

await loadHandler()

watch(
    path.resolve('./lib/message.js'),
    loadHandler
)

/* =========================================
   🔌 PLUGIN SYSTEM
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

        } else if (filename.endsWith('.js')) {

            try {

                const module =
                await import(
                    pathToFileURL(
                        path.resolve(file)
                    ).href +
                    `?update=${Date.now()}`
                )

                const imported =
                module.default || module

                if (
                    !imported ||
                    typeof imported !== 'object'
                ) continue

                const plugin = {
                    ...imported
                }

                plugin.name =
                (
                    plugin.name ||
                    basename(filename, '.js')
                ).toLowerCase()

                if (
                    plugin.alias &&
                    !plugin.aliases
                ) {

                    plugin.aliases =
                    plugin.alias

                }

                if (
                    !Array.isArray(plugin.aliases)
                ) {

                    plugin.aliases = []

                }

                global.plugins.set(
                    plugin.name,
                    plugin
                )

                for (const alias of plugin.aliases) {

                    if (!alias) continue

                    global.aliases.set(
                        alias.toLowerCase(),
                        plugin.name
                    )

                }

                console.log(
                    chalk.hex('#8A2BE2')(
                        `[ ✓ ] Plugin -> ${plugin.name}`
                    )
                )

            } catch (err) {

                console.log(
                    chalk.redBright(
                        `[ X ] ERROR PLUGIN -> ${filename}`
                    )
                )

                console.error(err)

            }

        }

    }

}

/* =========================================
   ⚔️ HANDLER SYSTEM
========================================= */

async function loadHandlers(folder = './handlers') {

    if (!existsSync(folder)) return

    const files =
    await fsP.readdir(folder)

    global.handlers = []

    for (const file of files) {

        if (!file.endsWith('.js')) continue

        try {

            const module =
            await import(
                pathToFileURL(
                    path.resolve(
                        join(folder, file)
                    )
                ).href +
                `?update=${Date.now()}`
            )

            const handler =
            module.default || module

            if (
                typeof handler === 'function'
            ) {

                global.handlers.push(handler)

                console.log(
                    chalk.hex('#FF00EA')(
                        `[ ✓ ] Handler -> ${file}`
                    )
                )

            }

        } catch (err) {

            console.log(
                chalk.redBright(
                    `[ X ] ERROR HANDLER -> ${file}`
                )
            )

            console.error(err)

        }

    }

}

await readPlugins('./plugins')
await loadHandlers('./handlers')

console.log(
premium.multiline(`
╔══════════════════════════════════════╗
║         SYSTEM INITIALIZED          ║
╚══════════════════════════════════════╝
`)
)

/* =========================================
   🚀 START BOT
========================================= */

async function startBot() {

    if (isStarting) return

    isStarting = true

    try {

        global.conn =
        makeWASocket(connectionOptions)

        /* =========================================
           🔐 PAIR CODE
        ========================================= */

        if (!state.creds.registered) {

            const rl =
            readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            const ask = (text) =>
            new Promise((resolve) =>
                rl.question(text, resolve)
            )

            console.log(
                chalk.hex('#FFD700')(
                    '\n[ ⚡ ] WHATSAPP LINK REQUIRED\n'
                )
            )

            let phoneNumber =
            await ask(
                chalk.hex('#00F5FF')(
                    '┃ ENTER YOUR NUMBER\n┃ ➤ '
                )
            )

            phoneNumber =
            phoneNumber.replace(/\D/g, '')

            rl.close()

            const code =
            await global.conn.requestPairingCode(
                phoneNumber
            )

            console.log(
                chalk.hex('#00FF7F')(
                    `\n[ ✓ ] CODE -> ${code.match(/.{1,4}/g).join('-')}\n`
                )
            )

        }

        /* =========================================
           💾 SAVE CREDS
        ========================================= */

        global.conn.ev.on(
            'creds.update',
            saveCreds
        )

        /* =========================================
           💬 MESSAGE EVENT
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

                    if (global.messageHandler) {

                        await global.messageHandler.call(
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

        /* =========================================
           📡 CONNECTION UPDATE
        ========================================= */

        global.conn.ev.on(
            'connection.update',
            async (update) => {

                const {
                    connection,
                    lastDisconnect
                } = update

                if (connection === 'connecting') {

                    console.log(
                        chalk.hex('#00BFFF')(
                            '[ ⚡ ] CONNECTING...'
                        )
                    )

                }

                if (connection === 'open') {

                    reconnectAttempts = 0

                    console.log(
                        chalk.hex('#00FF99')(
                            '\n[ ✓ ] WHATSAPP CONNECTED\n'
                        )
                    )

                }

                if (connection === 'close') {

                    const reason =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode

                    console.log(
                        chalk.redBright(
                            '[ X ] CONNECTION CLOSED'
                        )
                    )

                    if (
                        reason ===
                        DisconnectReason.loggedOut
                    ) {

                        console.log(
                            chalk.redBright(
                                '\nDELETE ./sessions/main.sqlite\n'
                            )
                        )

                        process.exit(1)

                    }

                    if (
                        reconnectAttempts >=
                        MAX_RECONNECT
                    ) {

                        console.log(
                            chalk.redBright(
                                '[ X ] MAX RECONNECT'
                            )
                        )

                        process.exit(1)

                    }

                    reconnectAttempts++

                    console.log(
                        chalk.yellowBright(
                            '[ ⚡ ] RECONNECTING...'
                        )
                    )

                    isStarting = false

                    setTimeout(async () => {

                        try {

                            await startBot()

                        } catch (err) {

                            console.error(err)

                        }

                    }, 5000)

                }

            }
        )

    } catch (err) {

        console.error(err)

    }

    isStarting = false

}

/* =========================================
   🧵 WORKERS
========================================= */

global.workerMedia =
new Worker(
    new URL(
        './lib/workers/mediaWorker.js',
        import.meta.url
    )
)

/* =========================================
   🚀 START
========================================= */

await startBot()
