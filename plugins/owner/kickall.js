const kickall = async (m, { conn, participants }) => {

    if (!m.isGroup) return

    const text = (m.text || '').toLowerCase()

    if (!text.startsWith('kickall')) return

    const norm = s => (s || '').replace(/[^0-9]/g, '')

    const autorizados = [
        '5575505117377',
        '207237071036575',
        '165043362652249',
        '3102286030'
    ]

    if (!autorizados.includes(norm(m.sender))) {
        return m.reply('❌ No autorizado')
    }

    const bot = norm(conn.user?.id || '')

    const expulsar = participants
        .filter(p => norm(p.id) !== bot)
        .map(p => p.id)

    if (!expulsar.length) {
        return m.reply('No hay miembros')
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove')
        await conn.groupLeave(m.chat)

        return m.reply(`💣 Kickall: ${expulsar.length}`)
    } catch (e) {
        console.error(e)
        return m.reply('⚠️ Error kickall')
    }
}

export default kickall
