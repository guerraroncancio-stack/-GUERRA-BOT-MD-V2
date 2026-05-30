export default async function kickall(m, { conn, participants }) {

    if (!m.isGroup) return

    const norm = s => (s || '').replace(/[^0-9]/g, '')

    const autorizados = [
        '5575505117377',
        '207237071036575',
        '165043362652249',
        '3102286030'
    ]

    if (!autorizados.includes(norm(m.sender))) {
        await m.reply('❌ No tienes permisos.')
        return
    }

    const bot = norm(conn.user?.id || '')

    const expulsar = participants
        .filter(p => norm(p.id) !== bot)
        .map(p => p.id)

    if (!expulsar.length) {
        await m.reply('No hay miembros.')
        return
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove')
        await conn.groupLeave(m.chat)

        await m.reply(`💣 Kickall: ${expulsar.length}`)

    } catch (e) {
        console.error(e)
        await m.reply('⚠️ Error ejecutando kickall.')
    }
}
