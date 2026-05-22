/* =========================================
   ⚔️ GUERRA BOT MD — STABLE CORE
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

import {
    Boom
} from '@hapi/boom'

import useSQLiteAuthState from './lib/auth.js'
import { database, User } from './lib/db.js'
import { smsg } from './lib/serializer.js'

/* =========================================
   ⚙️ BOT SETTINGS
========================================= */

global.BOT = {
    name: 'GUERRA BOT MD',
    owner: 'Kevin Guerra',
    version: '10.0.0',
    prefix: '.',
    mode: 'PUBLIC'
}

/* =========================================
   📦 MONGODB
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

    console.error(err)

})

process.on('unhandledRejection', (reason) => {

    const msg = String(reason)

    if (
        msg.includes('Connection Closed') ||
        msg.includes('Timed Out') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error(reason)

})

/* =========================================
   🎨 TERMINAL DESIGN
========================================= */

console.clear()

cfonts.say('GUERRA BOT', {
    font: 'block',
    align: 'center',
    gradient: ['cyan', 'blue']
})

console.log(
chalk.cyanBright(`
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
   ☁️ DATABASE CONNECT
========================================= */

try {

    await database.connect(MONGO_URI)

    global.db = mongoose.connection.db
    global.User = User

    console.log(
chalk.greenBright(`
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
   📲 AUTH STATE
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

    keepAliveIntervalMs: 10000,

    msgRetryCounterCache

}

/* =========================================
   🚀 CREATE CONNECTION
========================================= */

let isReconnecting = false

async function startBot() {

    global.conn =
    makeWASocket(connectionOptions)

    /* =========================================
       🔐 PAIR CODE
    ========================================= */

    if (!global.conn.authState?.creds?.registered) {

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
chalk.yellowBright(`
╔══════════════════════════════════════╗
║        WHATSAPP LINK REQUIRED       ║
╚══════════════════════════════════════╝
`)
        )

        let phoneNumber =
        await ask(
chalk.cyanBright(`
┃ ENTER YOUR NUMBER
┃ Example: 573001112233
┃ ➤ `)
        )

        phoneNumber =
        phoneNumber.replace(/\D/g, '')

        rl.close()

        if (!phoneNumber) {

            console.log(
chalk.redBright(`
[ X ] INVALID NUMBER
`)
            )

            process.exit(1)

        }

        setTimeout(async () => {

            try {

                const code =
                await global.conn.requestPairingCode(
                    phoneNumber
                )

                console.log(
chalk.greenBright(`
╔══════════════════════════════════════╗
║          LINK CODE READY            ║
╠══════════════════════════════════════╣
║  ${code.match(/.{1,4}/g).join('-')}
╚══════════════════════════════════════╝
`)
                )

            } catch (err) {

                console.log(
chalk.redBright(`
[ X ] PAIRING FAILED
`)
                )

                console.error(err)

            }

        }, 3000)

    }

    /* =========================================
       💾 SAVE CREDS
    ========================================= */

    global.conn.ev.on(
        'creds.update',
        saveCreds
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
chalk.yellowBright(`
[ ⚡ ] CONNECTING TO WHATSAPP...
`)
                )

            }

            if (connection === 'open') {

                isReconnecting = false

                console.log(
chalk.greenBright(`
╔══════════════════════════════════════╗
║       WHATSAPP CONNECTED            ║
╠══════════════════════════════════════╣
║ STATUS : ONLINE
╚══════════════════════════════════════╝
`)
                )

            }

            if (connection === 'close') {

                const reason =
                new Boom(
                    lastDisconnect?.error
                )?.output?.statusCode

                console.log(
chalk.redBright(`
[ X ] CONNECTION CLOSED
`)
                )

                if (
                    reason === DisconnectReason.loggedOut
                ) {

                    console.log(
chalk.redBright(`
╔══════════════════════════════════════╗
║          SESSION EXPIRED            ║
╠══════════════════════════════════════╣
║ DELETE:
║ ./sessions/main.sqlite
║
║ THEN RESTART THE BOT
╚══════════════════════════════════════╝
`)
                    )

                    process.exit(1)

                }

                if (!isReconnecting) {

                    isReconnecting = true

                    console.log(
chalk.yellowBright(`
[ ⚡ ] RECONNECTING IN 5 SECONDS...
`)
                    )

                    setTimeout(async () => {

                        try {

                            await startBot()

                        } catch (err) {

                            console.error(err)

                        }

                    }, 5000)

                }

            }

        }
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

}

/* =========================================
   📩 MESSAGE HANDLER
========================================= */

async function loadHandler() {

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

        global.messageHandler =
        module.message ||
        module.default?.message ||
        module.default

        console.log(
chalk.cyanBright(`
[ ✓ ] MESSAGE HANDLER LOADED
`)
        )

    } catch (err) {

        console.error(err)

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
   🔌 LOAD PLUGINS
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

            } catch (err) {

                console.error(err)

            }

        }

    }

}

await readPlugins('./plugins')

console.log(
chalk.magentaBright(`
╔══════════════════════════════════════╗
║         SYSTEM INITIALIZED          ║
╚══════════════════════════════════════╝
`)
)

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
   🚀 START BOT
========================================= */

await startBot()
