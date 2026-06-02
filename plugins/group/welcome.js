import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const DEFAULT_PP = 'https://api.dix.lat/media2/1777604199636.jpg'

// =========================
// SAFE BUFFER
// =========================
async function safeFetchBuffer(url) {
    try {
        const res = await fetch(url)
        if (!res.ok) return null
        const buf = await res.buffer()
        return Buffer.isBuffer(buf) ? buf : null
    } catch {
        return null
    }
}

// =========================
// TEMPLATE ENGINE
// =========================
function applyTemplate(template, vars, fallback) {
    if (!template || typeof template !== 'string') return fallback

    return template
        .replace(/@user/g, vars.user)
        .replace(/@group/g, vars.group)
        .replace(/@desc/g, vars.desc)
}

// =========================
// NORMALIZE JID
// =========================
function normalizeJid(jid) {
    if (!jid) return null
    return jid.includes('@') ? jid : jid + '@s.whatsapp.net'
}

// =========================
// MAIN PLUGIN
// =========================
const welcome = {

    name: 'welcome',
    alias: ['bienvenida', 'setwelcome', 'setbye'],
    category: 'group',

    run: async (m, { conn, args, isAdmin, isOwner }) => {

        if (!m.isGroup) return

        global.db.data = global.db.data || {}
        global.db.data.chats = global.db.data.chats || {}

        let chat = global.db.data.chats[m.chat] =
            global.db.data.chats[m.chat] || {}

        chat.welcome = chat.welcome ?? true
        chat.sWelcome = chat.sWelcome ?? ''
        chat.sBye = chat.sBye ?? ''

        const cmd = (args[0] || '').toLowerCase()

        // =========================
        // PANEL
        // =========================
        if (!cmd) {
            return conn.sendMessage(m.chat, {
                text:
`👋 *WELCOME SYSTEM*

📌 Estado: ${chat.welcome ? '🟢 ON' : '🔴 OFF'}

⚙️ Comandos:
.welcome on
.welcome off
.welcome set <texto>
.welcome bye <texto>

Variables:
@user @group @desc`
            }, { quoted: m })
        }

        // =========================
        // ON
        // =========================
        if (cmd === 'on') {
            if (!isAdmin && !isOwner) return m.reply('❌ Solo admins')

            chat.welcome = true
            return m.reply('🟢 Bienvenida activada')
        }

        // =========================
        // OFF
        // =========================
        if (cmd === 'off') {
            if (!isAdmin && !isOwner) return m.reply('❌ Solo admins')

            chat.welcome = false
            return m.reply('🔴 Bienvenida desactivada')
        }

        // =========================
        // SET WELCOME
        // =========================
        if (cmd === 'set') {
            if (!isAdmin && !isOwner) return m.reply('❌ Solo admins')

            chat.sWelcome = args.slice(1).join(' ')
            return m.reply('✅ Mensaje de bienvenida actualizado')
        }

        // =========================
        // SET BYE
        // =========================
        if (cmd === 'bye') {
            if (!isAdmin && !isOwner) return m.reply('❌ Solo admins')

            chat.sBye = args.slice(1).join(' ')
            return m.reply('✅ Mensaje de despedida actualizado')
        }

        return m.reply('❌ Comando inválido')

    },

    // =========================
    // EVENT LISTENER
    // =========================
    before: async (m, { conn, groupMetadata }) => {

        try {

            if (!m.isGroup) return
            if (!m.messageStubType) return

            global.db.data = global.db.data || {}
            global.db.data.chats = global.db.data.chats || {}

            let chat = global.db.data.chats[m.chat]
            if (!chat) return

            if (chat.welcome === false) return

            const params = m.messageStubParameters || []
            if (!params.length) return

            const group = groupMetadata?.subject || 'Grupo'
            const desc = groupMetadata?.desc || 'sin descripción'

            const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
            const isLeave = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
            const isKick = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE

            if (!isAdd && !isLeave && !isKick) return

            for (let raw of params) {

                const jid = normalizeJid(raw)
                if (!jid) continue

                const user = '@' + jid.split('@')[0]

                let text = ''

                if (isAdd) {
                    text = applyTemplate(
                        chat.sWelcome,
                        { user, group, desc },
                        `👋 Bienvenido ${user} al grupo *${group}*`
                    )
                }

                if (isLeave) {
                    text = applyTemplate(
                        chat.sBye,
                        { user, group, desc },
                        `👋 ${user} ha salido del grupo`
                    )
                }

                if (isKick) {
                    text = `🚫 ${user} fue expulsado del grupo`
                }

                let pp = DEFAULT_PP
                try {
                    pp = await conn.profilePictureUrl(jid, 'image')
                } catch {}

                const img = await safeFetchBuffer(pp)

                const payload = img
                    ? { image: img, caption: text, mentions: [jid] }
                    : { text, mentions: [jid] }

                await conn.sendMessage(m.chat, payload)

            }

        } catch (e) {
            console.log('[WELCOME ERROR]', e)
        }
    }
}

export default welcome
