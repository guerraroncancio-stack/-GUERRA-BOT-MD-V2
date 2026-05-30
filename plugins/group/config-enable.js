export async function featureEngine(m, conn) {

    const chat = global.db.data.chats[m.chat] || {}

    // =========================
    // 🔥 MODOMADMIN (BLOQUEO GLOBAL)
    // =========================
    if (chat.modoadmin) {
        const group = m.isGroup
            ? await conn.groupMetadata(m.chat).catch(() => null)
            : null

        const participants = group?.participants || []

        const isAdmin = participants.some(p =>
            p.id === m.sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )

        const isOwner = global.owner?.includes(m.sender)

        if (!isAdmin && !isOwner) {
            return false // bloquea TODO el bot
        }
    }

    // =========================
    // 🔥 WELCOME (ENTRADA/SALIDA)
    // =========================
    if (chat.welcome && m.isGroup && m.messageStubType) {

        const name = '@' + m.sender.split('@')[0]

        if (m.messageStubType === 27) {
            await conn.sendMessage(m.chat, {
                text: `👋 Bienvenido ${name} al grupo`,
                mentions: [m.sender]
            })
        }

        if (m.messageStubType === 28 || m.messageStubType === 32) {
            await conn.sendMessage(m.chat, {
                text: `👋 ${name} salió del grupo`
            })
        }
    }

    // =========================
    // 🔥 ANTILINK
    // =========================
    if (chat.antiLink && m.isGroup && m.text) {

        const isLink =
            /https?:\/\/|www\.|t\.me|discord\.gg|chat\.whatsapp\.com/i.test(m.text)

        if (isLink) {

            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]} enlaces no permitidos`,
                mentions: [m.sender]
            })

            // opcional: eliminar usuario
            await conn.groupParticipantsUpdate(
                m.chat,
                [m.sender],
                'remove'
            ).catch(() => {})
        }
    }

    return true
}
