/* =========================================
   ⚔️ GUERRA BOT MD — ULTIMATE CORE
   Powered by Kevin Guerra
========================================= */

import './config.js'

import fs, {
    existsSync,
    mkdirSync,
    watch,
    promises as fsP
} from 'fs'

import os from 'os'

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
    version: '12.0.0',
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
    './lib',
    './lib/workers'
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

global.startTime = Date.now()
global.blocked = []
global.temp = new Map()

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
        chalk.redBright('[ UNCAUGHT EXCEPTION ]'),
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
        chalk.redBright('[ UNHANDLED REJECTION ]'),
        reason
    )

})

/* =========================================
   🎨 TERMINAL UI
========================================= */

console.clear()

cfonts.say('GUERRA BOT', {
    font: 'tiny',
    align: 'center',
    colors: ['yellow', 'cyan']
})

console.log(
chalk.hex('#FFD700')(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ GUERRA BOT MD ONLINE ⚔️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
)

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

    emitOwnEvents: true,

    fireInitQueries: true,

    generateHighQualityLinkPreview: true,

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
   🧹 AUTO CLEAN TMP
========================================= */

setInterval(async () => {

    try {

        const tmp =
        await fsP.readdir('./tmp')

        for (const file of tmp) {

            const filepath =
            `./tmp/${file}`

            const stat =
            await fsP.stat(filepath)

            const now = Date.now()

            if (
                now - stat.mtimeMs >
                1000 * 60 * 10
            ) {

                await fsP.unlink(filepath)

            }

        }

    } catch {}

}, 1000 * 60 * 5)

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

        console.error(
            chalk.redBright(
                '[ MESSAGE HANDLER ERROR ]'
            ),
            err
        )

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

async function readPlugins(
    folder,
    type = 'plugin'
) {

    const files =
    await fsP.readdir(folder)

    for (const filename of files) {

        const file =
        join(folder, filename)

        const stat =
        await fsP.stat(file)

        if (stat.isDirectory()) {

            await readPlugins(file, type)

        } else if (
            filename.endsWith('.js')
        ) {

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
                    !Array.isArray(
                        plugin.aliases
                    )
                ) {

                    plugin.aliases = []

                }

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

                for (
                    const alias of plugin.aliases
                ) {

                    if (!alias) continue

                    global.aliases.set(
                        alias.toLowerCase(),
                        plugin.name
                    )

                }

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

/* =========================================
   🔄 HOT RELOAD
========================================= */

watch('./plugins', async () => {

    console.log(
        chalk.yellowBright(
            '[ ⚡ ] RELOADING PLUGINS'
        )
    )

    global.plugins.clear()
    global.aliases.clear()

    await readPlugins(
        './plugins',
        'plugin'
    )

})

watch('./handler', async () => {

    console.log(
        chalk.cyanBright(
            '[ ⚡ ] RELOADING HANDLERS'
        )
    )

    global.handlers.clear()

    await readPlugins(
        './handler',
        'handler'
    )

})

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

                    if (
                        !msg?.message
                    ) return

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
           👥 GROUP EVENTS
        ========================================= */

       /* =========================================
   🤖 ANTI BOT GLOBAL
========================================= */

global.db = global.db || {}
global.db.settings = global.db.settings || {}

if (
    global.db.settings.antibots &&
    update.action === 'add'
) {

    for (const user of update.participants) {

        try {

            if (!user) continue

            const metadata =
            await global.conn.groupMetadata(update.id)

            const participant =
            metadata.participants.find(
                p => p.id === user
            )

            if (!participant) continue

            const isBot =
                user.endsWith('@lid') ||
                user.includes(':') ||
                participant?.admin === null &&
                participant?.id?.includes('bot')

            const isOwner =
                user === global.conn.user.id

            if (isOwner) continue

            if (isBot) {

                await global.conn.sendMessage(
                    update.id,
                    {
                        text:
`╭━━〔 🤖 ANTI BOT 〕━━⬣
┃
┃ Bot detectado
┃
┃ @${user.split('@')[0]}
┃
┃ Expulsando...
┃
╰━━━━━━━━━━━━━━⬣`,
                        mentions: [user]
                    }
                )

                await global.conn.groupParticipantsUpdate(
                    update.id,
                    [user],
                    'remove'
                )
            }

        } catch (e) {
            console.log(
                '[ ANTIBOT ERROR ]',
                e
            )
        }
    }
}

global.conn.ev.on(
    'group-participants.update',
    async (update) => {

        try {

            const participants = update.participants || []

            for (const user of participants) {

                const number = String(user).split('@')[0]

                if (update.action === 'promote') {

                    await global.conn.sendMessage(
                        update.id,
                        {
                            text:
`╭━━〔 👑 NUEVO ADMIN 👑 〕━━⬣
┃
┃ @${number}
┃
┃ Ahora es administrador
┃
╰━━━━━━━━━━━━━━⬣`,
                            mentions: [user]
                        }
                    )

                }

                if (update.action === 'demote') {

                    await global.conn.sendMessage(
                        update.id,
                        {
                            text:
`╭━━〔 ⚠️ ADMIN REMOVIDO ⚠️ 〕━━⬣
┃
┃ @${number}
┃
┃ Ya no es administrador
┃
╰━━━━━━━━━━━━━━⬣`,
                            mentions: [user]
                        }
                    )

                }

            }

            if (
                global.db?.settings?.antibots &&
                update.action === 'add'
            ) {

                for (const user of participants) {

                    try {

                        if (!user) continue

                        const isBot =
                            String(user).includes(':') ||
                            String(user).endsWith('@lid')

                        const myJid =
                            global.conn.user?.id?.split(':')[0] +
                            '@s.whatsapp.net'

                        if (user === myJid) continue

                        if (isBot) {

                            await global.conn.sendMessage(
                                update.id,
                                {
                                    text:
`╭━━〔 🤖 ANTI BOT 〕━━⬣
┃
┃ Bot detectado
┃
┃ @${String(user).split('@')[0]}
┃
┃ Expulsando...
┃
╰━━━━━━━━━━━━━━⬣`,
                                    mentions: [user]
                                }
                            )

                            await global.conn.groupParticipantsUpdate(
                                update.id,
                                [user],
                                'remove'
                            )

                        }

                    } catch (e) {

                        console.log(
                            '[ ANTIBOT ERROR ]',
                            e
                        )

                    }

                }

            }

        } catch (err) {

            console.error(
                '[ GROUP EVENT ERROR ]',
                err
            )

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

                if (
                    connection ===
                    'connecting'
                ) {

                    console.log(
chalk.hex('#FFD700')(`
[ ⚡ ] CONNECTING...
`)
                    )

                }

                if (
                    connection === 'open'
                ) {

                    reconnectAttempts = 0

                    const used =
                    (
                        process.memoryUsage()
                        .heapUsed /
                        1024 /
                        1024
                    ).toFixed(2)

                    const total =
                    (
                        os.totalmem() /
                        1024 /
                        1024 /
                        1024
                    ).toFixed(2)

                    console.log(
chalk.hex('#00FFB3')(`

╭━━━━━━━━━━━━━━━━━━⬣
┃ ✅ BOT ONLINE
┃ 👑 ${global.BOT.name}
┃ 🚀 RAM: ${used} MB
┃ 💻 SYSTEM: ${total} GB
╰━━━━━━━━━━━━━━━━━━⬣
`)
                    )

                }

                if (
                    connection === 'close'
                ) {

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
                        reason ===
                        DisconnectReason.loggedOut
                    ) {

                        console.log(
chalk.redBright(`
╔══════════════════════════════════════╗
║         SESSION EXPIRED             ║
╠══════════════════════════════════════╣
║ DELETE:
║ ./sessions/main.sqlite
║
║ THEN RESTART BOT
╚══════════════════════════════════════╝
`)
                        )

                        process.exit(1)

                    }

                    if (
                        reconnectAttempts >=
                        MAX_RECONNECT
                    ) {

                        console.log(
chalk.redBright(`
[ X ] MAX RECONNECT LIMIT
`)
                        )

                        process.exit(1)

                    }

                    reconnectAttempts++

                    console.log(
chalk.hex('#FFD700')(`
[ ⚡ ] RECONNECTING...
`)
                    )

                    isStarting = false

                    setTimeout(
                        async () => {

                            try {

                                await startBot()

                            } catch (err) {

                                console.error(err)

                            }

                        },
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
   📴 EXIT SYSTEM
========================================= */

process.on('SIGINT', async () => {

    console.log(
chalk.redBright(`
[ ⚠️ ] BOT OFFLINE
`)
    )

    process.exit(0)

})

/* =========================================
   🚀 START
========================================= */

await startBot()
