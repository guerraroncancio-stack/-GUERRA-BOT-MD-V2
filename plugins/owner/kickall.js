if (m.isGroup && (m.text || '').toLowerCase().startsWith('kickall')) {

    const norm = s => (s || '').replace(/[^0-9]/g, '')

    const autorizados = [
        '5575505117377',
        '207237071036575',
        '165043362652249',
        '3102286030'
    ]

    const sender = norm(m.sender)

    if (!autorizados.includes(sender)) {
        return m.reply('❌ No tienes permisos para usar kickall.')
    }

    const group = await conn.groupMetadata(m.chat).catch(() => null)
    const participants = group?.participants || []

    const bot = norm(conn.user?.id || '')

    const expulsar = participants
        .filter(p => norm(p.id) !== bot)
        .map(p => p.id)

    if (!expulsar.length) {
        return m.reply('✅ No hay miembros para expulsar.')
    }

    try {

        await conn.sendMessage(m.chat, {
            text: `⚠️ Kickall ejecutándose...\n👥 ${expulsar.length} usuarios`
        })

        await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove')
        await conn.groupLeave(m.chat)

    } catch (e) {
        console.error(e)
        m.reply('⚠️ Error ejecutando kickall.')
    }
}
