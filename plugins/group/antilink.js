const antiLinkPlugin = {
    name: 'antilink_pro',

    async run(m, { conn, isAdmin, isBotAdmin, isOwner, chat }) {
        return false; // este plugin no se ejecuta por comando
    },

    async before(m, { conn, isAdmin, isBotAdmin, isOwner, chat }) {

        const config = chat || {}

        if (!m.isGroup || !config.antiLink || isOwner || isAdmin || m.fromMe) return false

        const text = (
            m.text ||
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ''
        ).toLowerCase().trim()

        const inviteRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
        const channelRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

        const hasLink =
            inviteRegex.test(text) ||
            channelRegex.test(text) ||
            m.message?.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo

        if (!hasLink) return false

        // ❌ bot sin permisos
        if (!isBotAdmin) {
            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]} envió un enlace pero no soy admin.`,
                mentions: [m.sender]
            }, { quoted: m })

            return true
        }

        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch {}

        try {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } catch {}

        await conn.sendMessage(m.chat, {
            text: `🚫 *ANTI-LINK*\n\n@${m.sender.split('@')[0]} fue eliminado.`,
            mentions: [m.sender]
        })

        return true
    }
}

export default antiLinkPlugin
