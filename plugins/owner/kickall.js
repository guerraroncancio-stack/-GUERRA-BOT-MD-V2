const kickall = async (m, { conn, participants }) => {

    if (!m.isGroup) return

    const norm = s => (s || '').replace(/[^0-9]/g, '')

    const autorizados = [
        '5575505117377',
        '207237071036575',
        '165043362652249',
        '3102286030'
    ]

    const sender = norm(m.sender)

    if (!autorizados.includes(sender)) {
        return m.reply('❌ No tienes permisos para usar esto.')
    }

    // =========================
    // 🔐 PASO 1: PREGUNTA
    // =========================
    if (!m.quoted && !global.kickallConfirm) {

        global.kickallConfirm = {
            chat: m.chat,
            user: m.sender,
            step: 'wait'
        }

        return m.reply(
            `⚠️ *CONFIRMACIÓN KICKALL*\n\n` +
            `¿Estás seguro que quieres expulsar a TODOS?\n\n` +
            `Responde:\n` +
            `✔ *si* = ejecutar\n` +
            `❌ *no* = cancelar`
        )
    }

    // =========================
    // 🔐 PASO 2: RESPUESTA
    // =========================
    if (global.kickallConfirm?.chat === m.chat) {

        const text = (m.text || '').toLowerCase()

        if (text === 'no') {
            global.kickallConfirm = null
            return m.reply('❌ Kickall cancelado.')
        }

        if (text === 'si' || text === 'sí') {

            const botJid = norm(conn.user?.id || conn.user?.jid || '')

            const expulsar = participants
                .filter(p => norm(p.id) !== botJid)
                .map(p => p.id)

            global.kickallConfirm = null

            if (!expulsar.length) {
                return m.reply('✅ No hay miembros para expulsar.')
            }

            try {
                await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove')
                await conn.groupLeave(m.chat)

                return m.reply(`💣 Kickall ejecutado: ${expulsar.length} miembros eliminados.`)

            } catch (e) {
                console.error(e)
                return m.reply('⚠️ Error ejecutando kickall.')
            }
        }
    }
}

export default kickall
