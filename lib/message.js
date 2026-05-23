import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'
import fs, { unwatchFile, watchFile } from 'fs'

import chalk from 'chalk'

import {
    jidNormalizedUser
} from '@whiskeysockets/baileys'

import { getRealJid } from './identifier.js'
import { cacheManager } from './cache.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* =========================================
   🧠 GLOBALS
========================================= */

global.subbotConfig ||= {}
global.plugins ||= new Map()
global.aliases ||= new Map()
global.userCache ||= new Map()
global.owner ||= []

/* =========================================
   🚀 MESSAGE HANDLER
========================================= */

export async function message(m, chatUpdate) {

    try {

        const conn = this

        if (!m || !conn || !conn.user) return

        conn.uptime ||= Date.now()

        /* =========================================
           ⏱️ IGNORE OLD MESSAGES
        ========================================= */

        const msgTime = (
            m.messageTimestamp?.low ||
            m.messageTimestamp ||
            0
        ) * 1000

        if (
            msgTime &&
            Date.now() - msgTime > 60000
        ) return

        /* =========================================
           🤖 BOT INFO
        ========================================= */

        const botJid = jidNormalizedUser(
            conn.user.id || ''
        )

        const mainBotJid = jidNormalizedUser(
            global.conn?.user?.id || ''
        )

        const isMainBot = botJid === mainBotJid

        /* =========================================
           ⚙️ SETTINGS
        ========================================= */

        if (
            !global.subbotConfig[botJid] &&
            !isMainBot &&
            global.SubBotSettings
        ) {

            try {

                const data =
                await global.SubBotSettings
                .findOne({
                    botId: botJid
                })
                .lean()

                if (data) {
                    global.subbotConfig[botJid] = data
                }

            } catch {}

        }

        const botSettings =
        global.subbotConfig[botJid] || {

            prefix: ['.'],

            botName:
            global.BOT?.name ||
            'GUERRA BOT MD',

            botImage:
            typeof global.img === 'function'
            ? global.img()
            : null

        }

        conn.settings = botSettings

        /* =========================================
           📩 MESSAGE INFO
        ========================================= */

        const chatJid = m.chat || ''

        const msgText = (
            m.text ||
            m.msg?.text ||
            m.msg?.caption ||
            ''
        ).trim()

        const prefixes =
        Array.isArray(conn.settings.prefix)
        ? conn.settings.prefix
        : [conn.settings.prefix || '.']

        const usedPrefix =
        prefixes.find(p =>
            msgText.startsWith(p)
        )

        /* =========================================
           👤 SENDER CHECK
        ========================================= */

        if (
            !m.sender ||
            typeof m.sender !== 'string'
        ) return

        if (
            !m.sender.includes('@')
        ) return

        /* =========================================
           🆔 REAL JID
        ========================================= */

        let realSenderId = m.sender

        try {

            realSenderId =
            await getRealJid(
                conn,
                m.sender,
                m
            )

        } catch {}

        if (!realSenderId) {
            realSenderId = m.sender
        }

        const senderNumber =
        realSenderId
        .split('@')[0]
        .split(':')[0]

        const isROwner =
        Array.isArray(global.owner)
        ? global.owner.some(([num]) =>
            String(num)
            .replace(/\D/g, '') === senderNumber
        )
        : false

        const botNumber =
        botJid
        .split('@')[0]
        .split(':')[0]

        const isSelf =
        senderNumber === botNumber

        /* =========================================
           🚫 IGNORE SYSTEM
        ========================================= */

        if (
            m.messageStubType &&
            m.isGroup
        ) return

        /* =========================================
           💬 CHAT DATA
        ========================================= */

        let chat = null
        let user = null

        try {

            if (
                m.isGroup &&
                global.Chat
            ) {

                chat =
                await global.Chat
                .findOne({
                    id: chatJid
                })
                .lean()

                if (!chat) {

                    chat =
                    await global.Chat.create({

                        id: chatJid,

                        isBanned: false,
                        welcome: true,
                        detect: true,

                        muto: false,
                        mutos: [],

                        antiLink: false,
                        modoadmin: false,

                        autoStickers: false,
                        antisub: false,

                        nsfw: false,
                        antiStatus: false

                    })

                }

            }

        } catch (err) {

            console.log(
                chalk.red('[ CHAT ERROR ]'),
                err.message
            )

        }

        /* =========================================
           👤 USER DATA
        ========================================= */

        try {

            user =
            global.userCache.get(realSenderId)

            if (
                !user &&
                global.User &&
                usedPrefix
            ) {

                user =
                await global.User
                .findOne({
                    id: realSenderId
                })
                .lean()

                if (!user) {

                    user =
                    await global.User.create({

                        id: realSenderId,

                        name:
                        m.pushName || 'User',

                        exp: 0,
                        col: 100,

                        warnAntiLink: 0,

                        banned: false,

                        lastSeen: new Date()

                    })

                }

                if (user) {

                    global.userCache.set(
                        realSenderId,
                        user
                    )

                }

            }

        } catch (err) {

            console.log(
                chalk.red('[ USER ERROR ]'),
                err.message
            )

        }

        /* =========================================
           👥 GROUP DATA
        ========================================= */

        let participants = []
        let isAdmin = false
        let isBotAdmin = false

        if (
            m.isGroup &&
            cacheManager
        ) {

            try {

                const metadata =
                await cacheManager.get(
                    conn,
                    chatJid
                )

                participants =
                metadata?.participants || []

                isAdmin =
                cacheManager.getAdminStatus(
                    chatJid,
                    m.sender,
                    m.author
                )

                isBotAdmin =
                cacheManager.getAdminStatus(
                    chatJid,
                    conn.user.id,
                    conn.user.lid
                )

            } catch {}

        }

        /* =========================================
           🔌 BEFORE HOOKS
        ========================================= */

        for (const plugin of global.plugins.values()) {

            if (
                typeof plugin.before === 'function'
            ) {

                try {

                    const stop =
                    await plugin.before.call(
                        conn,
                        m,
                        {
                            conn,
                            chat,
                            user,
                            isAdmin,
                            isBotAdmin,
                            isROwner,
                            isSelf,
                            participants
                        }
                    )

                    if (stop) return

                } catch (err) {

                    console.log(
                        chalk.red(
                            `[ BEFORE ERROR ] ${plugin.name}`
                        )
                    )

                }

            }

        }

        /* =========================================
           ❌ NO PREFIX
        ========================================= */

        if (!usedPrefix) return

        /* =========================================
           ⚡ COMMAND PARSER
        ========================================= */

        const noPrefix =
        msgText
        .slice(usedPrefix.length)
        .trim()

        const args =
        noPrefix.split(/\s+/)

        const command =
        (args.shift() || '')
        .toLowerCase()

        const text =
        args.join(' ').trim()

        /* =========================================
           🔎 SEARCH COMMAND
        ========================================= */

        const pluginName =
        global.plugins.has(command)
        ? command
        : global.aliases.get(command)

        const plugin =
        global.plugins.get(pluginName)

        if (!plugin) return

        /* =========================================
           🔐 PERMISSIONS
        ========================================= */

        const perms = {

            rowner: isROwner,
            owner: isROwner,

            group: m.isGroup,
            private: !m.isGroup,

            admin: isAdmin,
            botAdmin: isBotAdmin,

            self: isSelf

        }

        for (const perm of [

            'rowner',
            'owner',
            'group',
            'private',
            'admin',
            'botAdmin',
            'self'

        ]) {

            if (
                plugin[perm] &&
                !perms[perm]
            ) {

                return global.dfail(
                    perm,
                    m,
                    conn
                )

            }

        }

        /* =========================================
           👁️ READ MESSAGE
        ========================================= */

        await conn.readMessages(
            [m.key]
        ).catch(() => null)

        /* =========================================
           🚀 EXECUTE
        ========================================= */

        try {

            if (
                typeof plugin.run !== 'function'
            ) {

                console.log(
                    chalk.red(
                        `[ INVALID PLUGIN ] ${plugin.name}`
                    )
                )

                return
            }

            await plugin.run.call(
                conn,
                m,
                {

                    conn,

                    usedPrefix,
                    noPrefix,

                    args,
                    command,
                    text,

                    chat,
                    user,

                    isROwner,
                    isAdmin,
                    isBotAdmin,
                    isSelf,

                    participants,

                    settings:
                    conn.settings || {}

                }
            )

            console.log(
                chalk.cyanBright(
                    `[ COMMAND ] ${command}`
                )
            )

        } catch (err) {

            console.log(
                chalk.red(
                    `[ COMMAND ERROR ] ${command}`
                )
            )

            console.error(err)

        }

        /* =========================================
           💾 CACHE SAVE
        ========================================= */

        if (
            user &&
            global.userCache
        ) {

            global.userCache.set(
                realSenderId,
                user
            )

        }

    } catch (err) {

        console.log(
            chalk.red(
                '[ MESSAGE HANDLER ERROR ]'
            )
        )

        console.error(err)

    }

}

/* =========================================
   ❌ FAIL SYSTEM
========================================= */

global.dfail = (
    type,
    m,
    conn,
    cost
) => {

    const messages = {

        rowner:
        '⚠️ Solo el creador puede usar este comando.',

        owner:
        '⚠️ Solo el owner puede usar este comando.',

        group:
        '⚠️ Este comando es solo para grupos.',

        private:
        '⚠️ Este comando es solo para privado.',

        admin:
        '⚠️ Solo admins pueden usar esto.',

        botAdmin:
        '⚠️ Necesito admin.',

        col:
        `⚠️ Necesitas ${cost} coins.`,

        self:
        '⚠️ Solo el host puede usar esto.'

    }

    if (
        messages[type] &&
        m?.chat
    ) {

        conn.reply(
            m.chat,
            messages[type],
            m
        ).catch(() => null)

    }

}

/* =========================================
   🔄 AUTO RELOAD
========================================= */

watchFile(
    __filename,
    async () => {

        unwatchFile(__filename)

        console.log(
            chalk.yellowBright(
                `[ UPDATE ] ${path.basename(__filename)}`
            )
        )

        try {

            await import(
                `${pathToFileURL(__filename).href}?update=${Date.now()}`
            )

        } catch (err) {

            console.error(err)

        }

    }
)

export default {
    message
}
