/* =========================
   GUERRA BOT CORE SETTINGS
========================= */

import 'dotenv/config'
import NodeCache from 'node-cache'
import cfonts from 'cfonts'

/* =========================
   BRANDING
========================= */

global.BOT_NAME = 'GUERRA BOT'
global.BOT_VERSION = '7.0.0'
global.BOT_PREFIX = '.'
global.OWNER_NAME = 'Kevin Guerra'
global.OWNER_NUMBER = '573000000000'
global.BOT_STATUS = 'ONLINE'
global.BOT_MODE = 'PUBLIC'

/* =========================
   DATABASE
========================= */

global.MONGO_DB_URI =
process.env.MONGO_DB_URI ||
'mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/bot'

/* =========================
   SYSTEM
========================= */

global.system = {
    name: global.BOT_NAME,
    version: global.BOT_VERSION,
    owner: global.OWNER_NAME,
    prefix: global.BOT_PREFIX,
    startTime: Date.now(),
    platform: process.platform,
    mode: global.BOT_MODE
}

/* =========================
   CACHE SYSTEM
========================= */

global.userCache = new Map()

global.commandCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false
})

global.groupCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 600,
    useClones: false
})

/* =========================
   ANTI CRASH
========================= */

process.removeAllListeners('warning')
process.setMaxListeners(0)

process.on('multipleResolves', () => {})

process.on('uncaughtException', (err) => {

    const msg = err?.message || ''

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error('⚠️ ERROR:', err)
})

process.on('unhandledRejection', (reason) => {

    const msg = String(reason?.message || reason || '')

    if (
        msg.includes('Connection Closed') ||
        msg.includes('timed out') ||
        msg.includes('rate-overlimit') ||
        msg.includes('Bad MAC') ||
        msg.includes('decrypt')
    ) return

    console.error('⚠️ PROMISE:', reason)
})

/* =========================
   TERMINAL BRANDING
========================= */

console.clear()

cfonts.say(global.BOT_NAME, {
    font: 'block',
    gradient: ['red', 'magenta'],
    align: 'center',
    lineHeight: 1,
    letterSpacing: 1
})

console.log(`
╔══════════════════════════════╗
║      GUERRA BOT MD          ║
╠══════════════════════════════╣
║ OWNER   : ${global.OWNER_NAME}
║ VERSION : ${global.BOT_VERSION}
║ MODE    : ${global.BOT_MODE}
║ STATUS  : ${global.BOT_STATUS}
╚══════════════════════════════╝
`)
