/* =========================================
   GUERRA BOT MD — CORE ENGINE
   Powered by Kevin Guerra
========================================= */

import process from 'process'
import os from 'os'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import cfonts from 'cfonts'
import NodeCache from 'node-cache'
import mongoose from 'mongoose'
import pino from 'pino'

/* =========================================
   GLOBAL BRANDING
========================================= */

global.BOT = {
    name: 'GUERRA BOT',
    version: '7.1.0',
    owner: 'Kevin Guerra',
    number: '573000000000',
    prefix: '.',
    mode: 'PUBLIC',
    status: 'ONLINE',
    codename: 'WAR-X',
    started: Date.now()
}

/* =========================================
   MONGODB
========================================= */

global.MONGO_URI =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority'

/* =========================================
   LOGGER
========================================= */

global.logger = pino({
    level: 'silent'
})

/* =========================================
   CACHE SYSTEM
========================================= */

global.cache = {
    users: new Map(),
    groups: new NodeCache({
        stdTTL: 300,
        checkperiod: 600,
        useClones: false
    }),

    commands: new NodeCache({
        stdTTL: 60,
        checkperiod: 120,
        useClones: false
    }),

    cooldowns: new NodeCache({
        stdTTL: 5,
        checkperiod: 10,
        useClones: false
    })
}

/* =========================================
   SYSTEM INFO
========================================= */

global.system = {
    platform: os.platform(),
    cpu: os.cpus()[0]?.model,
    memory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    hostname: os.hostname(),
    node: process.version,
    uptime: process.uptime()
}

/* =========================================
   FOLDERS
========================================= */

const folders = [
    './session',
    './temp',
    './src',
    './src/commands',
    './src/events',
    './src/system',
    './src/database',
    './src/media',
    './src/logs'
]

for (const folder of folders) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
    }
}

/* =========================================
   TERMINAL CLEANER
========================================= */

console.clear()

/* =========================================
   CYBERPUNK BANNER
========================================= */

cfonts.say(global.BOT.name, {
    font: 'block',
    align: 'center',
    gradient: ['red', 'magenta'],
    lineHeight: 1,
    letterSpacing: 1
})

console.log(
chalk.hex('#ff004c')(`
╔══════════════════════════════════════╗
║           GUERRA BOT MD             ║
╠══════════════════════════════════════╣
║ OWNER    : ${global.BOT.owner}
║ VERSION  : ${global.BOT.version}
║ MODE     : ${global.BOT.mode}
║ STATUS   : ${global.BOT.status}
║ ENGINE   : ${global.BOT.codename}
╚══════════════════════════════════════╝
`)
)

/* =========================================
   DATABASE CONNECTION
========================================= */

try {

    await mongoose.connect(global.MONGO_URI)

    console.log(
        chalk.greenBright(`
[ ✓ ] MONGODB CONNECTED
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
   MEMORY MONITOR
========================================= */

setInterval(() => {

    const used = process.memoryUsage()

    const ram = {
        rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`,
        heap: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`
    }

    global.system.ram = ram

}, 10000)

/* =========================================
   ANTI CRASH
========================================= */

process.removeAllListeners('warning')
process.setMaxListeners(0)

process.on('multipleResolves', () => {})

process.on('uncaughtException', async(err) => {

    const msg = err?.message || ''

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit') ||
        msg.includes('Bad MAC') ||
        msg.includes('Connection Failure')
    ) return

    console.log(
        chalk.redBright(`
[ CRASH DETECTED ]
`)
    )

    console.error(err)

})

process.on('unhandledRejection', async(reason) => {

    const msg = String(reason?.message || reason || '')

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit')
    ) return

    console.log(
        chalk.yellowBright(`
[ PROMISE ERROR ]
`)
    )

    console.error(reason)

})

/* =========================================
   HOT RELOAD
========================================= */

const file = path.resolve('./index.js')

fs.watchFile(file, () => {

    fs.unwatchFile(file)

    console.log(
        chalk.cyanBright(`
[ SYSTEM ] INDEX UPDATED
`)
    )

    import(`${file}?update=${Date.now()}`)

})

/* =========================================
   FINAL BOOT
========================================= */

console.log(
chalk.magentaBright(`
╔══════════════════════════════════════╗
║        GUERRA BOT INITIALIZED       ║
╚══════════════════════════════════════╝
`)
)
