import { jidNormalizedUser } from '@whiskeysockets/baileys';

const antiLinkPlugin = {
    name: 'antilink_pro',

    async before(m, { conn, isAdmin, isBotAdmin, isOwner, chat }) {

        // 🔥 seguridad base
        const group = m.isGroup
        const config = chat || {}

        if (!group || !config.antiLink || isOwner || isAdmin || m.fromMe) {
            return false
        }

        // 🔥 extracción segura de texto
        const text = (
            m.text ||
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
            ''
        ).toLowerCase().trim()

        // 🔥 patrones reales
        const inviteRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
        const channelRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i
        const isForwardedChannel =
            m.message?.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo ||
            m.msg?.contextInfo?.forwardedNewsletterMessageInfo

        const hasLink =
            inviteRegex.test(text) ||
            channelRegex.test(text) ||
            isForwardedChannel

        if (!hasLink) return false

        // 🔥 ignorar link del propio grupo
        if (inviteRegex.test(text)) {
            const code = await conn.groupInviteCode(m.chat).catch(() => null)
            if (code && text.includes(code.toLowerCase())) return false
        }

        // 🔥 si NO es bot admin
        if (!isBotAdmin) {
            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]} envió un enlace, pero no soy admin para sancionar.`,
                mentions: [m.sender]
            }, { quoted: m })

            return true
        }

        // 🔥 borrar mensaje
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch {}

        // 🔥 expulsar usuario
        try {
            await conn.groupParticipantsUpdate(
                m.chat,
                [m.sender],
                'remove'
            )
        } catch {}

        // 🔥 aviso final
        await conn.sendMessage(m.chat, {
            text: `🚫 *ENLACE DETECTADO*\n\n@${m.sender.split('@')[0]} fue eliminado del grupo.`,
            mentions: [m.sender]
        })

        return true
    }
}

export default antiLinkPlugin
