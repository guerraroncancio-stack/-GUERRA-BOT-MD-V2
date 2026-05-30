export async function featureModoadmin(m, conn) {

    const chat = global.db?.data?.chats?.[m.chat] || {}

    if (!m.isGroup || !chat.modoadmin) return true

    const sender = m.sender

    const group = await conn.groupMetadata(m.chat).catch(() => null)
    const participants = group?.participants || []

    // 🔐 verificar admin real
    const isAdmin = participants.some(p =>
        p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
    )

    // 👑 owner bypass
    const isOwner = global.owner?.includes(sender)

    if (isAdmin || isOwner) return true

    // ❌ bloquear acceso
    await conn.sendMessage(m.chat, {
        text:
`🔐 *MODO ADMIN ACTIVADO*

🚫 @${sender.split('@')[0]} no puede usar el bot en este grupo.

⚠️ Solo administradores tienen acceso.`,
        mentions: [sender]
    })

    return false
}
