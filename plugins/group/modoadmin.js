async function onMessage(m, conn) {

    // 🔐 AQUÍ VA EL MODO ADMIN
    const chat = global.db.data.chats[m.chat] || {}

    if (m.isGroup && chat.modoadmin) {

        const group = await conn.groupMetadata(m.chat).catch(() => null)
        const participants = group?.participants || []

        const isAdmin = participants.some(p =>
            p.id === m.sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )

        const isOwner = global.owner?.includes(m.sender)

        if (!isAdmin && !isOwner) {
            await conn.sendMessage(m.chat, {
                text: `🔐 MODO ADMIN ACTIVADO`,
                mentions: [m.sender]
            })
            return
        }
    }

    // 👉 aquí sigue TODO tu bot normal
}
