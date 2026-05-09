import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

/* =========================
   DATABASE DEFAULTS
========================= */

const userDefault = {
    exp: 0,
    diamantes: 15,
    registered: false,
    name: '',
    description: '',
    age: -1,
    regTime: -1,
    afk: -1,
    afkReason: '',
    banned: false,
    bannedReason: '',
    muto: false,
    useDocument: false,
    bank: 0,
    level: 0,
    role: 'Novato',
    premium: false,
    premiumTime: 0,
    warn: 0,
    spam: 0,
    antispam: 0
}

const chatDefault = {
    isBanned: false,
    welcome: true,
    detect: true,
    delete: false,
    antiLink: false,
    antiLink2: false,
    antiBot: false,
    antiBot2: false,
    antiPrivate: false,
    antifake: false,
    antiver: false,
    nsfw: false,
    reaction: false,
    simi: false,
    audios: false,
    autoresponder: false,
    autolevelup: false,
    autoaceptar: false,
    autorechazar: false,
    onlyLatinos: false,
    modoadmin: false,
    expired: 0,
    sAutoresponder: '',
    sWelcome: '',
    sBye: '',
    sKick: ''
}

const settingsDefault = {
    self: false,
    restrict: true,
    antiPrivate: false,
    autoread: false,
    autoread2: false,
    antiSpam: true,
    jadibotmd: false,
    banned: false,
    status: 0
}

/* =========================
   MAIN HANDLER
========================= */

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []

    if (!chatUpdate?.messages?.length) return

    try {
        this.pushMessage(chatUpdate.messages).catch(console.error)

        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return

        if (global.db.data == null) await global.loadDatabase()

        m = smsg(this, m) || m
        if (!m) return

        m.exp = 0
        m.diamantes = 0

        /* =========================
           DATABASE
        ========================= */

        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') {
            global.db.data.users[m.sender] = {}
        }

        user = global.db.data.users[m.sender]
        Object.assign(user, structuredClone(userDefault), user)

        if (!user.name) user.name = m.pushName || 'Sin Nombre'

        let chat = global.db.data.chats[m.chat]
        if (typeof chat !== 'object') {
            global.db.data.chats[m.chat] = {}
        }

        chat = global.db.data.chats[m.chat]
        Object.assign(chat, structuredClone(chatDefault), chat)

        let settings = global.db.data.settings[this.user.jid]
        if (typeof settings !== 'object') {
            global.db.data.settings[this.user.jid] = {}
        }

        settings = global.db.data.settings[this.user.jid]
        Object.assign(settings, structuredClone(settingsDefault), settings)

        /* =========================
           OPTIONS
        ========================= */

        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return

        if (typeof m.text !== 'string') m.text = ''

        /* =========================
           OWNER / PREMIUM
        ========================= */

        const senderNumber = m.sender.replace(/[^0-9]/g, '')

        const isROwner = [
            conn.decodeJid(global.conn.user.id),
            ...(global.owner || []).map(([n]) => n)
        ]
            .map(v => (v || '').replace(/[^0-9]/g, ''))
            .includes(senderNumber)

        const isOwner = isROwner || m.fromMe

        const isMods = isOwner || (global.mods || [])
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(m.sender)

        const isPrems = isROwner ||
            (global.prems || [])
                .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
                .includes(m.sender) ||
            user.premium

        /* =========================
           QUEUE
        ========================= */

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            const queque = this.msgqueque
            const previousID = queque[queque.length - 1]

            queque.push(m.id || m.key.id)

            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(5000)
            }, 5000)
        }

        if (m.isBaileys) return

        m.exp += Math.ceil(Math.random() * 10)

        /* =========================
           GROUP
        ========================= */

        const groupMetadata = m.isGroup
            ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => null))
            : {}

        const participants = groupMetadata?.participants || []

        const userAdmin = m.isGroup
            ? participants.find(u => conn.decodeJid(u.id) === m.sender)
            : {}

        const botAdmin = m.isGroup
            ? participants.find(u => conn.decodeJid(u.id) === this.user.jid)
            : {}

        const isRAdmin = userAdmin?.admin === 'superadmin'
        const isAdmin = isRAdmin || userAdmin?.admin === 'admin'
        const isBotAdmin = botAdmin?.admin === 'admin'

        /* =========================
           PLUGINS
        ========================= */

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        for (const name in global.plugins) {
            const plugin = global.plugins[name]

            if (!plugin) continue
            if (plugin.disabled) continue

            const __filename = join(___dirname, name)

            try {
                if (typeof plugin.all === 'function') {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                }
            } catch (e) {
                console.error(e)
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

            const _prefix = plugin.customPrefix
                ? plugin.customPrefix
                : conn.prefix
                    ? conn.prefix
                    : global.prefix

            const match = (
                _prefix instanceof RegExp
                    ? [[_prefix.exec(m.text), _prefix]]
                    : Array.isArray(_prefix)
                        ? _prefix.map(p => {
                            const re = p instanceof RegExp
                                ? p
                                : new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]
                        })
                        : typeof _prefix === 'string'
                            ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
                            : [[[], new RegExp]]
            ).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot: botAdmin,
                    isROwner,
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue

            let usedPrefix = (match[0] || '')[0]
            if (!usedPrefix) continue

            const noPrefix = m.text.replace(usedPrefix, '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)

            command = (command || '').toLowerCase()

            const text = args.join` `
            const _args = noPrefix.trim().split` `.slice(1)

            const isAccept = plugin.command instanceof RegExp
                ? plugin.command.test(command)
                : Array.isArray(plugin.command)
                    ? plugin.command.some(cmd =>
                        cmd instanceof RegExp
                            ? cmd.test(command)
                            : cmd === command
                    )
                    : typeof plugin.command === 'string'
                        ? plugin.command === command
                        : false

            if (!isAccept) continue

            m.plugin = name

            /* =========================
               RESTRICTIONS
            ========================= */

            if (chat?.isBanned && !isROwner) return

            if (user?.banned && !isROwner) {
                if (user.antispam > 2) return

                m.reply(
`🚫 *Estás baneado del bot.*

📝 Motivo:
${user.bannedReason || 'Sin especificar'}

📞 Contacto del owner:
wa.me/18456897070`
                )

                user.antispam++
                return
            }

            if (chat.modoadmin && m.isGroup && !isAdmin && !isOwner) return

            if (plugin.rowner && !isROwner) {
                fail('rowner', m, this)
                continue
            }

            if (plugin.owner && !isOwner) {
                fail('owner', m, this)
                continue
            }

            if (plugin.mods && !isMods) {
                fail('mods', m, this)
                continue
            }

            if (plugin.premium && !isPrems) {
                fail('premium', m, this)
                continue
            }

            if (plugin.group && !m.isGroup) {
                fail('group', m, this)
                continue
            }

            if (plugin.botAdmin && !isBotAdmin) {
                fail('botAdmin', m, this)
                continue
            }

            if (plugin.admin && !isAdmin) {
                fail('admin', m, this)
                continue
            }

            if (plugin.private && m.isGroup) {
                fail('private', m, this)
                continue
            }

            if (plugin.register && !user.registered) {
                fail('unreg', m, this)
                continue
            }

            /* =========================
               EXECUTE
            ========================= */

            m.isCommand = true

            let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17

            if (xp > 200) {
                m.reply('⚠️ Plugin mal configurado.')
            } else {
                m.exp += xp
            }

            if (
                !isPrems &&
                plugin.diamantes &&
                user.diamantes < plugin.diamantes
            ) {
                conn.reply(m.chat, `💎 No tienes suficientes diamantes.`, m)
                continue
            }

            const extra = {
                match,
                usedPrefix,
                noPrefix,
                _args,
                args,
                command,
                text,
                conn: this,
                participants,
                groupMetadata,
                user,
                bot: botAdmin,
                isROwner,
                isOwner,
                isRAdmin,
                isAdmin,
                isBotAdmin,
                isPrems,
                chatUpdate,
                __dirname: ___dirname,
                __filename
            }

            try {
                await plugin.call(this, m, extra)

                if (!isPrems) {
                    m.diamantes = plugin.diamantes || 0
                }

            } catch (e) {
                m.error = e
                console.error(e)

                let error = format(e)

                m.reply(error)
            } finally {

                if (typeof plugin.after === 'function') {
                    try {
                        await plugin.after.call(this, m, extra)
                    } catch (e) {
                        console.error(e)
                    }
                }

                if (m.diamantes) {
                    conn.reply(
                        m.chat,
                        `💎 Usaste ${m.diamantes} diamantes.`,
                        m
                    )
                }
            }

            break
        }

    } catch (e) {
        console.error(e)

    } finally {

        if (opts['queque'] && m?.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)

            if (quequeIndex !== -1) {
                this.msgqueque.splice(quequeIndex, 1)
            }
        }

        /* =========================
           SAVE STATS
        ========================= */

        let user
        const stats = global.db.data.stats

        if (m) {

            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.diamantes -= m.diamantes * 1
            }

            if (m.plugin) {

                const now = +new Date

                if (!(m.plugin in stats)) {
                    stats[m.plugin] = {
                        total: 0,
                        success: 0,
                        last: now,
                        lastSuccess: now
                    }
                }

                const stat = stats[m.plugin]

                stat.total += 1
                stat.last = now

                if (!m.error) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        /* =========================
           PRINT
        ========================= */

        try {
            if (!opts['noprint']) {
                await (await import('./lib/print.js')).default(m, this)
            }
        } catch (e) {
            console.error(e)
        }

        /* =========================
           AUTOREAD
        ========================= */

        const settingsREAD = global.db.data.settings[this.user.jid] || {}

        if (opts['autoread']) {
            await this.readMessages([m.key])
        }

        if (settingsREAD.autoread2) {
            await this.readMessages([m.key])
        }

        /* =========================
           REACTIONS
        ========================= */

        if (
            db.data.chats[m.chat]?.reaction &&
            m.text
        ) {

            const emojis = [
                '🔥', '⚡', '💎', '👑',
                '✨', '💥', '🗿', '😹',
                '🌸', '🍓', '❤️', '🐈'
            ]

            const emot = emojis[Math.floor(Math.random() * emojis.length)]

            if (!m.fromMe) {
                await this.sendMessage(m.chat, {
                    react: {
                        text: emot,
                        key: m.key
                    }
                })
            }
        }
    }
}

/* =========================
   FAIL
========================= */

global.dfail = (type, m, conn) => {

    const msg = {
        rowner: '👑 Este comando solo puede ser usado por el creador principal.',
        owner: '👑 Este comando solo puede ser usado por el owner.',
        mods: '🛡️ Este comando es exclusivo para moderadores.',
        premium: '💎 Este comando es exclusivo para usuarios premium.',
        group: '👥 Este comando solo funciona en grupos.',
        private: '📩 Este comando solo funciona en privado.',
        admin: '⚠️ Solo los administradores pueden usar este comando.',
        botAdmin: '🤖 Necesito ser administrador para ejecutar este comando.',
        restrict: '🚫 Esta función está desactivada.'
    }[type]

    if (msg) {
        return conn.reply(m.chat, msg, m).then(() => m.react('❌'))
    }
}

/* =========================
   HOT RELOAD
========================= */

let file = global.__filename(import.meta.url, true)

watchFile(file, async () => {
    unwatchFile(file)

    console.log(chalk.yellowBright("✔ Se actualizó 'handler.js'"))

    if (global.reloadHandler) {
        console.log(await global.reloadHandler())
    }
})
