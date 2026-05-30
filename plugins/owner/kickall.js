if (m.isGroup && (m.text || '').toLowerCase().startsWith('kickall')) {

    const norm = s => (s || '').replace(/[^0-9]/g, '')

    const autorizados = [
        '5575505117377',
        '207237071036575',
        '165043362652249',
        '3102286030'
    ]

    if (!autorizados.includes(norm(m.sender))) {
        return m.reply('❌ No tienes permisos para usar kickall.')
    }

    const chat = global.kickallConfirm || {}

    // =========================
    // 🔐 PASO 1: PREGUNTA
    // =========================
    if (!chat[m.chat]) {

        global.kickallConfirm = {
            [m.chat]: {
                user: m.sender,
                step: 'confirm'
            }
        }

        return m.reply(
            `⚠️ *CONFIRMACIÓN KICKALL*\n\n` +
            `¿Seguro que quieres expulsar a todos?\n\n` +
            `Responde: *si* o *no*`
        )
    }

    // =========================
    // 🔐 PASO 2: RESPUESTA
    // =========================
    const state = global.kickallConfirm[m.chat]

    const text = (m.text || '').toLowerCase()

    if (text === 'no') {
        delete global.kickallConfirm[m.chat]
        return m.reply('❌ Cancelado.')
    }

    if (text === 'si') {

        const bot = norm(conn.user?.id || '')

        const participants = await conn.groupMetadata(m.chat)
            .then(m => m.participants)
            .catch(() => [])

        const expulsar = participants
            .filter(p => norm(p.id) !== bot)
            .map(p => p.id)

        delete global.kickallConfirm[m.chat]

        if (!expulsar.length) {
            return m.reply('No hay miembros.')
        }

        try {
            await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove')
            await conn.groupLeave(m.chat)

            return m.reply(`💣 Kickall ejecutado: ${expulsar.length}`)

        } catch (e) {
            console.error(e)
            return m.reply('⚠️ Error ejecutando kickall.')
        }
    }
}
