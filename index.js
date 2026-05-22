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
    './lib'
]

for (const folder of folders) {
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true })
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

const logger = pino({ level: 'silent' })

/* =========================================
   📲 AUTH (IMPORTANT FIX HERE)
========================================= */

const sessionFile = './sessions/main.sqlite'

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
   ⚡ CONNECTION OPTIONS (FIXED)
========================================= */

const msgRetryCounterCache = new NodeCache()

const connectionOptions = {

    version,

    logger,

    printQRInTerminal: false,

    browser: Browsers.macOS('Chrome'),

    // 🔴 FIX REAL: NO custom key store
    auth: state,

    markOnlineOnConnect: false,

    syncFullHistory: false,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 15000,

    msgRetryCounterCache
}

/* =========================================
   🔄 CONTROL
========================================= */

let isStarting = false
let reconnectAttempts = 0
const MAX_RECONNECT = 10

/* =========================================
   🚀 START BOT
========================================= */

async function startBot() {

    if (isStarting) return
    isStarting = true

    try {

        global.conn = makeWASocket(connectionOptions)

        /* =========================================
           🔐 PAIRING CODE
        ========================================= */

        if (!state.creds.registered) {

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            const ask = (text) =>
                new Promise(resolve => rl.question(text, resolve))

            let phoneNumber = await ask('ENTER NUMBER: ')
            phoneNumber = phoneNumber.replace(/\D/g, '')
            rl.close()

            const code = await global.conn.requestPairingCode(phoneNumber)

            console.log(
                code.match(/.{1,4}/g).join('-')
            )
        }

        /* =========================================
           💾 SAVE CREDS (CRITICAL)
        ========================================= */

        global.conn.ev.on('creds.update', saveCreds)

        /* =========================================
           💬 MESSAGES
        ========================================= */

        global.conn.ev.on('messages.upsert', async (chatUpdate) => {

            const msg = chatUpdate.messages?.[0]
            if (!msg?.message) return

            const m = await smsg(global.conn, msg)

            if (global.messageHandler) {
                await global.messageHandler.call(global.conn, m, chatUpdate)
            }
        })

        /* =========================================
           📡 CONNECTION UPDATE
        ========================================= */

        global.conn.ev.on('connection.update', async (update) => {

            const { connection, lastDisconnect } = update

            if (connection === 'open') {
                reconnectAttempts = 0
                console.log('[ ✓ ] CONNECTED')
            }

            if (connection === 'close') {

                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode

                if (reason === DisconnectReason.loggedOut) {
                    console.log('SESSION EXPIRED - DELETE ./sessions/main.sqlite')
                    process.exit(1)
                }

                if (reconnectAttempts >= MAX_RECONNECT) {
                    console.log('MAX RECONNECT REACHED')
                    process.exit(1)
                }

                reconnectAttempts++
                isStarting = false

                setTimeout(() => startBot(), 5000)
            }
        })

    } catch (err) {
        console.error(err)
    }

    isStarting = false
}

/* =========================================
   🚀 INIT
========================================= */

await startBot()
