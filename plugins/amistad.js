const amistad = {
    name: 'amistad',
    alias: ['lovecheck', 'compatibilidad', 'friends'],
    category: 'fun',

    run: async (m, { conn, text }) => {

        const jid = (id) => {
            if (!id) return null
            if (typeof id !== 'string') return null
            if (!id.includes('@s.whatsapp.net')) return null
            return id
        }

        // =========================
        // USUARIOS
        // =========================
        const user1 = jid(m.sender)

        let user2 =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

        user2 = jid(user2)

        if (!user2 || user2 === user1) {
            return m.reply('🤝 Uso:\n.amistad @usuario o responde a alguien')
        }

        // =========================
        // GENERAR % AMISTAD
        // =========================
        const percent = Math.floor(Math.random() * 101)

        let estado = ''
        if (percent >= 90) estado = '🔥 Mejores amigos inseparables'
        else if (percent >= 70) estado = '💙 Muy buena amistad'
        else if (percent >= 40) estado = '🙂 Buena relación'
        else if (percent >= 20) estado = '😐 Amistad normal'
        else estado = '💔 Casi no se llevan'

        // =========================
        // MENSAJE
        // =========================
        const msg = `
🤝 *TEST DE AMISTAD*

👤 Usuario 1: @${user1.split('@')[0]}
👤 Usuario 2: @${user2.split('@')[0]}

📊 Compatibilidad: ${percent}%

📌 Estado: ${estado}

✨ ¡La amistad es aleatoria!
`

        await conn.sendMessage(m.chat, {
            text: msg.trim(),
            mentions: [user1, user2]
        }, { quoted: m })
    }
}

export default amistad
