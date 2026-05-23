import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import { jidNormalizedUser } from '@whiskeysockets/baileys'

import { getRealJid } from './identifier.js'
import { cacheManager } from './cache.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* =========================================
   🧠 GLOBAL SAFE DEFAULTS
========================================= */

global.subbotConfig = global.subbotConfig || {}
global.plugins = global.plugins || new Map()
global.aliases = global.aliases || new Map()
global.userCache = global.userCache || new Map()
global.owner = global.owner || []

/* =========================================
   🚀 MESSAGE HANDLER
========================================= */

export async function message(m, chatUpdate) {
    try {
        const conn = this

        if (!m || !conn?.user) return

        this.uptime = this.uptime || Date.now()

        /* =========================================
           ⏱️ ANTI OLD MESSAGE
        ========================================= */

        const msgTime = (
            m.messageTimestamp?.low ||
            m.messageTimestamp ||
            0
        ) * 1000

        if (msgTime && Date.now() - msgTime > 30000) return

        /* =========================================
           🤖 BOT INFO
        ========================================= */

        const botJid = jidNormalizedUser(conn.user.id || '')
        const mainBotJid = jidNormalizedUser(global.conn?.user?.id || '')
        const isMainBot = botJid === mainBotJid

        /* =========================================
           📩 MESSAGE TEXT SAFE
        ========================================= */

        const rawText =
            m?.text ||
            m?.msg?.text ||
            m?.msg?.caption ||
            ''

        if (typeof rawText !== 'string') return

        const msgText = rawText.trim()

        /* =========================================
           PREFIX
        ========================================= */

        const prefixes = Array.isArray(conn.settings?.prefix)
            ? conn.settings.prefix
            : [conn.settings?.prefix || '.']

        const usedPrefix = prefixes.find(p =>
            msgText.startsWith(p)
        )

        /* =========================================
           👤 SENDER CHECK
        ========================================= */

        if (!m.sender?.endsWith('@s.whatsapp.net')) return

        /* =========================================
           🆔 REAL JID
        ========================================= */

        let realSenderId = m.sender

        try {
            realSenderId = await getRealJid(conn, m.sender, m)
        } catch {}

        if (!realSenderId) realSenderId = m.sender

        const senderNumber = realSenderId.split('@')[0].split(':')[0]
        const botNumber = botJid.split('@')[0].split(':')[0]

        const isROwner = Array.isArray(global.owner)
            ? global.owner.some(([num]) =>
                String(num).replace(/\D/g, '') === senderNumber
            )
            : false

        const isSelf = senderNumber === botNumber

        /* =========================================
           🚫 EMPTY MESSAGE CHECK
        ========================================= */

        if (
            !msgText &&
            !m?.msg?.image &&
            !m?.msg?.video &&
            !m?.msg?.audio &&
            !m?.msg?.sticker &&
            !m?.msg?.document
        ) return

        /* =========================================
           🔌 PLUGINS BEFORE
        ========================================= */

        const plugins = Array.from(global.plugins.values())

        for (const plugin of plugins) {
            if (typeof plugin?.before === 'function') {
                try {
                    const stop = await plugin.before.call(conn, m, {
                        conn,
                        isROwner,
                        isSelf
                    })

                    if (stop) return
                } catch {}
            }
        }

        /* =========================================
           ❌ NO PREFIX EXIT
        ========================================= */

        if (!usedPrefix) return

        /* =========================================
           ⚡ COMMAND PARSER
        ========================================= */

        const noPrefix = msgText.slice(usedPrefix.length).trim()

        const [commandName, ...args] = noPrefix.split(/\s+/)

        const command = (commandName || '').toLowerCase()

        const text = args.join(' ').trim()

        /* =========================================
           🔎 FIND PLUGIN (FIXED SAFE VERSION)
        ========================================= */

        let pluginName = global.plugins.has(command)
            ? command
            : null

        if (!pluginName) {
            const aliasTarget = global.aliases.get(command)

            if (aliasTarget && global.plugins.has(aliasTarget)) {
                pluginName = aliasTarget
            }
        }

        if (!pluginName) return

        const plugin = global.plugins.get(pluginName)

        if (!plugin || typeof plugin.run !== 'function') return

        /* =========================================
           🚀 EXECUTE COMMAND
        ========================================= */

        try {
            await plugin.run.call(conn, m, {
                conn,
                usedPrefix,
                noPrefix,
                args,
                command,
                text,
                isROwner
            })
        } catch (err) {
            console.log(chalk.red(`[ COMMAND ERROR ] ${command}`))
            console.error(err)
        }

    } catch (err) {
        console.log(chalk.red('[ MESSAGE ERROR ]'))
        console.error(err)
    }
}

/* =========================================
   🔄 AUTO RELOAD
========================================= */

watchFile(__filename, async () => {
    unwatchFile(__filename)

    console.log(
        chalk.yellowBright(`[ UPDATE ] ${path.basename(__filename)}`)
    )

    try {
        await import(`${pathToFileURL(__filename).href}?update=${Date.now()}`)
    } catch (err) {
        console.error(err)
    }
})
