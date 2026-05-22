/* =========================================
   GUERRA BOT MD — CORE SYSTEM
   Powered by Kevin Guerra
========================================= */

import { Worker } from 'worker_threads'
import mongoose from 'mongoose'
import path, { join, basename } from 'path'
import fs, {
    existsSync,
    mkdirSync,
    watch,
    watchFile,
    unwatchFile,
    promises as fsP
} from 'fs'

import chalk from 'chalk'
import pino from 'pino'
import yargs from 'yargs'
import readline from 'readline'
import cfonts from 'cfonts'
import NodeCache from 'node-cache'

import { Boom } from '@hapi/boom'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { EventEmitter } from 'events'

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
   BRANDING
========================================= */

global.BOT = {
    name: 'GUERRA BOT',
    version: '7.1.0',
    owner: 'Kevin Guerra',
    number: '573000000000',
    prefix: '.',
    mode: 'PUBLIC',
    status: 'ONLINE'
}

/* =========================================
   MONGODB
========================================= */

const MONGO_URI =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority'

/* =========================================
   CACHE
========================================= */

global.userCache = new Map()
global.plugins = new Map()
global.aliases = new Map()
global.conns = new Map()

global.commandCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false
})

/* =========================================
   LOGGER
========================================= */

const logger = pino({
    level: 'silent'
})

/* =========================================
   FOLDERS
========================================= */

const folders = [
    './sessions',
    './tmp',
    './plugins',
    './lib',
    './database'
]

for (const folder of folders) {
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true })
    }
}

/* =========================================
   TERMINAL
========================================= */

console.clear()

cfonts.say(global.BOT.name, {
    font: 'block',
    align: 'center',
    gradient: ['red', 'magenta']
})

console.log(
chalk.redBright(`
╔══════════════════════════════╗
║        GUERRA BOT MD        ║
╠══════════════════════════════╣
║ OWNER  : ${global.BOT.owner}
║ MODE   : ${global.BOT.mode}
║ STATUS : ${global.BOT.status}
╚══════════════════════════════╝
`)
)

/* =========================================
   DATABASE CONNECT
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
   BAILEYS VERSION
========================================= */

const { version } = await fetchLatestBaileysVersion()

/* =========================================
   AUTH
========================================= */

const sessionFile = './sessions/main.sqlite'

const {
    state,
    saveCreds
} = useSQLiteAuthState(sessionFile)

/* =========================================
   SOCKET CONFIG
========================================= */

const msgRetryCounterCache = new NodeCache()

const connectionOptions = {

    version,
    logger,

    browser: Browsers.macOS('Chrome'),

    printQRInTerminal: false,

    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
            state.keys,
            logger
        )
    },

    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,

    markOnlineOnConnect: true,
    syncFullHistory: false,

    msgRetryCounterCache

}

/* =========================================
   CREATE CONNECTION
========================================= */

global.conn = makeWASocket(connectionOptions)

global.conns.set('main', global.conn)

/* =========================================
   REQUEST PAIR CODE
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
        chalk.cyanBright(`
┃ NÚMERO WHATSAPP:
┃ `)
    )

    phoneNumber = phoneNumber.replace(/\D/g, '')

    rl.close()

    setTimeout(async() => {

        try {

            const code = await global.conn.requestPairingCode(
                phoneNumber
            )

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

let messageHandler = null

const loadHandler = async() => {

    try {

        const file =
        path.join(process.cwd(), 'lib/message.js')

        const module =
        await import(`file://${file}?update=${Date.now()}`)

        messageHandler =
        module.message ||
        module.default?.message ||
        module.default

    } catch (err) {

        console.error(err)

    }

}

await loadHandler()

watch(
    path.join(process.cwd(), 'lib/message.js'),
    loadHandler
)

/* =========================================
   CONNECTION EVENTS
========================================= */

global.conn.ev.on(
    'connection.update',
    async(update) => {

        const {
            connection,
            lastDisconnect
        } = update

        if (connection === 'open') {

            console.log(
                chalk.greenBright(`
[ ✓ ] WHATSAPP CONNECTED
`)
            )

        }

        if (connection === 'close') {

            const reason =
            new Boom(lastDisconnect?.error)
            ?.output?.statusCode

            if (
                reason === DisconnectReason.loggedOut
            ) {

                console.log(
                    chalk.redBright(`
[ X ] SESSION CLOSED
`)
                )

                process.exit(1)

            } else {

                console.log(
                    chalk.yellowBright(`
[ ! ] RECONNECTING...
`)
                )

                setTimeout(() => {

                    global.conn = makeWASocket(
                        connectionOptions
                    )

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
    async(chatUpdate) => {

        try {

            const msg =
            chatUpdate.messages?.[0]

            if (!msg?.message) return

            const m =
            await smsg(global.conn, msg)

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
                console.error(err)
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
   PLUGIN SYSTEM
========================================= */

async function readPlugins(folder) {

    const files = await fsP.readdir(folder)

    for (const filename of files) {

        const file = join(folder, filename)

        const stat = await fsP.stat(file)

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

                global.plugins.set(name, plugin)

                if (plugin.alias) {

                    const aliases =
                    Array.isArray(plugin.alias)
                    ? plugin.alias
                    : [plugin.alias]

                    for (const alias of aliases) {
                        global.aliases.set(alias, name)
                    }

                }

            } catch (err) {

                console.error(err)

            }

        }

    }

}

await readPlugins(
    join(process.cwd(), './plugins')
)

/* =========================================
   HOT RELOAD
========================================= */

watchFile(import.meta.url, async() => {

    unwatchFile(import.meta.url)

    console.log(
        chalk.cyanBright(`
[ SYSTEM ] INDEX UPDATED
`)
    )

})

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
   FINAL
========================================= */

console.log(
chalk.magentaBright(`
╔══════════════════════════════╗
║      SYSTEM INITIALIZED      ║
╚══════════════════════════════╝
`)
)
