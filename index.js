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
    './handler',
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

global.plugins = new Map()
global.aliases = new Map()
global.handlers = new Map()

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

    console.error(chalk.redBright(err))

})

process.on('unhandledRejection', (reason) => {

    const msg = String(reason)

    if (
        msg.includes('Connection Closed') ||
        msg.includes('Timed Out') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error(chalk.redBright(reason))

})

/* =========================================
   🎨 TERMINAL UI
========================================= */

console.clear()

cfonts.say('GUERRA BOT', {
    font: 'block',
    align: 'center',
    gradient: ['#00F5FF', '#7F00FF']
})

console.log(
chalk.hex('#00F5FF')(`
╔══════════════════════════════════════╗
║           ⚔️ GUERRA BOT ⚔️           ║
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
chalk.hex('#00FFB3')(`
[ ✓ ] DATABASE CONNECTED
`)
    )

} catch (err) {

    console.log(
chalk.redBright(`
[ X ] DATABASE ERROR
`)
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

    markOnlineOnConnect: true,

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
chalk.hex('#00FFB3')(`
[ ✓ ] MESSAGE HANDLER LOADED
`)
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
   🔌 LOAD PLUGINS
========================================= */

async function readPlugins(folder, type = 'plugin') {

    if (!existsSync(folder)) return

    const files =
    await fsP.readdir(folder)

    for (const filename of files) {

        const file =
        join(folder, filename)

        const stat =
        await fsP.stat(file)

        if (stat.isDirectory()) {

            await readPlugins(file, type)

        } else if (filename.endsWith('.js')) {

            try {

                const module =
                await import(
                    pathToFileURL(
                        path.resolve(file)
                    ).href +
                    `?update=${Date.now()}`
                )

                let imported =
                module.default || module

                if (
                    typeof imported === 'function'
                ) {

                    imported = {
                        run: imported
                    }

                }

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

                /* =================================
                   FIX RUN SUPPORT
                ================================= */

                plugin.run =
                plugin.run ||
                plugin.execute ||
                plugin.start ||
                plugin.handler

                if (
                    typeof plugin.run !==
                    'function'
                ) {

                    console.log(
chalk.redBright(
`[ X ] INVALID PLUGIN -> ${filename}`
)
                    )

                    continue

                }

                /* =================================
                   FIX COMMAND SUPPORT
                ================================= */

                if (
                    plugin.command &&
                    !Array.isArray(plugin.command)
                ) {

                    plugin.command =
                    [plugin.command]

                }

                if (
                    !plugin.command
                ) {

                    plugin.command = []

                }

                /* =================================
                   FIX ALIAS SUPPORT
                ================================= */

                if (
                    plugin.alias &&
                    !plugin.aliases
                ) {

                    plugin.aliases =
                    plugin.alias

                }

                if (
                    plugin.aliases &&
                    !Array.isArray(plugin.aliases)
                ) {

                    plugin.aliases =
                    [plugin.aliases]

                }

                if (
                    !plugin.aliases
                ) {

                    plugin.aliases = []

                }

                /* =================================
                   SAVE PLUGIN
                ================================= */

                if (type === 'plugin') {

                    global.plugins.set(
                        plugin.name,
                        plugin
                    )

                } else {

                    global.handlers.set(
                        plugin.name,
                        plugin
                    )

                }

                /* =================================
                   SAVE COMMANDS
                ================================= */

                for (const cmd of plugin.command) {

                    if (!cmd) continue

                    global.aliases.set(
                        cmd.toLowerCase(),
                        plugin.name
                    )

                }

                /* =================================
                   SAVE ALIASES
                ================================= */

                for (const alias of plugin.aliases) {

                    if (!alias) continue

                    global.aliases.set(
                        alias.toLowerCase(),
                        plugin.name
                    )

                }

                /* =================================
                   AUTO RELOAD
                ================================= */

                watch(file, async () => {

                    console.log(
chalk.yellowBright(
`[ UPDATE ] ${plugin.name}`
)
                    )

                    global.plugins.delete(
                        plugin.name
                    )

                    global.aliases.forEach(
                        (value, key) => {

                            if (
                                value === plugin.name
                            ) {

                                global.aliases.delete(
                                    key
                                )

                            }

                        }
                    )

                    await readPlugins(
                        folder,
                        type
                    )

                })

                console.log(
chalk.hex('#7F00FF')(
`[ ✓ ] ${type.toUpperCase()} LOADED -> ${plugin.name}`
)
                )

            } catch (err) {

                console.log(
chalk.redBright(`
[ X ] ERROR LOADING:
${filename}
`)
                )

                console.error(err)

            }

        }

    }

}

await readPlugins('./plugins', 'plugin')
await readPlugins('./handler', 'handler')

console.log(
chalk.hex('#00F5FF')(`
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
chalk.hex('#FFD700')(`
╔══════════════════════════════════════╗
║       WHATSAPP LINK REQUIRED        ║
╚══════════════════════════════════════╝
`)
            )

            let phoneNumber =
            await ask(
chalk.hex('#00F5FF')(`
┃ ENTER YOUR NUMBER
┃ Example: 573001112233
┃ ➤ `)
            )

            phoneNumber =
            phoneNumber.replace(/\D/g, '')

            rl.close()

            const code =
            await global.conn.requestPairingCode(
                phoneNumber
            )

            console.log(
chalk.hex('#00FFB3')(`
╔══════════════════════════════════════╗
║         LINK CODE READY             ║
╠══════════════════════════════════════╣
║  ${code.match(/.{1,4}/g).join('-')}
╚══════════════════════════════════════╝
`)
            )

        }

        global.conn.ev.on(
            'creds.update',
            saveCreds
        )

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

                    if (
                        global.messageHandler
                    ) {

                        await global.messageHandler.call(
                            global.conn,
                            m,
                            chatUpdate
                        )

                    }

                } catch (err) {

                    console.error(err)

                }

            }
        )

        global.conn.ev.on(
            'connection.update',
            async (update) => {

                const {
                    connection,
                    lastDisconnect
                } = update

                if (connection === 'connecting') {

                    console.log(
chalk.hex('#FFD700')(`
[ ⚡ ] CONNECTING...
`)
                    )

                }

                if (connection === 'open') {

                    reconnectAttempts = 0

                    console.log(
chalk.hex('#00FFB3')(`
╔══════════════════════════════════════╗
║        WHATSAPP CONNECTED           ║
╚══════════════════════════════════════╝
`)
                    )

                }

                if (connection === 'close') {

                    const reason =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode

                    if (
                        reason ===
                        DisconnectReason.loggedOut
                    ) {

                        console.log(
chalk.redBright(`
SESSION EXPIRED
DELETE:
./sessions/main.sqlite
`)
                        )

                        process.exit(1)

                    }

                    reconnectAttempts++

                    if (
                        reconnectAttempts >=
                        MAX_RECONNECT
                    ) {

                        process.exit(1)

                    }

                    isStarting = false

                    setTimeout(
                        startBot,
                        5000
                    )

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

try {

    global.workerMedia =
    new Worker(
        new URL(
            './lib/workers/mediaWorker.js',
            import.meta.url
        )
    )

} catch {

    console.log(
chalk.yellowBright(
'[ ⚠️ ] MEDIA WORKER NOT FOUND'
)
    )

}

/* =========================================
   🚀 START
========================================= */

await startBot()
