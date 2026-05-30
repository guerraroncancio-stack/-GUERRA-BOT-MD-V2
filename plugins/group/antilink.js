const chat = global.db.data.chats[m.chat] || {}

if (
    m.isGroup &&
    chat.antiLink &&
    !m.fromMe
) {

    const text = (
        m.text ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        ''
    ).toLowerCase()

    const linkRegex = /chat\.whatsapp\.com\/([0-9a-z]{20,24})/i
    const channelRegex = /whatsapp\.com\/channel\/([0-9a-z]{20,24})/i

    const isLink = linkRegex.test(text) || channelRegex.test(text)

    if (isLink) {

        const sender = m.sender || m.key.participant

        const user = `@${sender.split('@')[0]}`

        const metadata = await conn.groupMetadata(m.chat).catch(() => null)
        const participants = metadata?.participants || []

        const isAdmin = participants.some(p =>
            p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )

        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'

        const botIsAdmin = participants.some(p =>
            p.id === botId &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )

        if (isAdmin) return

        // 🚫 si bot no es admin
        if (!botIsAdmin) {
            await conn.sendMessage(m.chat, {
                text: `🚫 @${sender.split('@')[0]} envió un link, pero no soy admin para sancionar.`,
                mentions: [sender]
            })
            return
        }

        // 🧹 borrar mensaje
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch {}

        // 👢 expulsar
        try {
            await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        } catch {}

        // ⚠️ aviso
        await conn.sendMessage(m.chat, {
            text:
`🚫 *ANTI-LINK ACTIVADO*

${user} fue eliminado.

⚠️ No está permitido enviar enlaces.`,
            mentions: [sender]
        })
    }
}
