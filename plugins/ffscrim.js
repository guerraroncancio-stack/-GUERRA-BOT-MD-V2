const scrims = global.scrims = global.scrims || {}

const scrim = {
    name: 'scrim',
    alias: ['torneo', 'match', 'custom'],
    category: 'games',

    run: async (m, { conn, text, command }) => {

        const chat = m.chat

        scrims[chat] = scrims[chat] || {
            active: false,
            players: [],
            host: m.sender
        }

        const data = scrims[chat]

        const sub = (text || '').toLowerCase()

        // =========================
        // INICIAR SCRIM
        // =========================
        if (sub === 'start') {
            if (data.active) return m.reply('⚠️ Ya hay un scrim activo.')

            data.active = true
            data.players = []

            return conn.sendMessage(chat, {
                text: `🎮 *SCRIM INICIADA*

📢 Host: @${m.sender.split('@')[0]}
🔥 Estado: ABIERTA
📌 Escribe *.scrim join* para entrar`,
                mentions: [m.sender]
            }, { quoted: m })
        }

        // =========================
        // UNIRSE
        // =========================
        if (sub === 'join') {
            if (!data.active) return m.reply('❌ No hay scrim activa.')

            if (data.players.includes(m.sender)) {
                return m.reply('⚠️ Ya estás registrado.')
            }

            data.players.push(m.sender)

            return conn.sendMessage(chat, {
                text: `✅ @${m.sender.split('@')[0]} se unió a la scrim`,
                mentions: [m.sender]
            }, { quoted: m })
        }

        // =========================
        // LISTA
        // =========================
        if (sub === 'list') {
            if (!data.active) return m.reply('❌ No hay scrim activa.')

            let list = `🎮 *SCRIM PLAYERS*\n\n`

            data.players.forEach((p, i) => {
                list += `#${i + 1} @${p.split('@')[0]}\n`
            })

            return conn.sendMessage(chat, {
                text: list,
                mentions: data.players
            }, { quoted: m })
        }

        // =========================
        // FINALIZAR
        // =========================
        if (sub === 'end') {
            if (!data.active) return m.reply('❌ No hay scrim activa.')

            if (m.sender !== data.host) {
                return m.reply('⚠️ Solo el host puede cerrar la scrim.')
            }

            if (!data.players.length) {
                data.active = false
                return m.reply('❌ No hubo participantes.')
            }

            const winner = data.players[Math.floor(Math.random() * data.players.length)]

            data.active = false

            return conn.sendMessage(chat, {
                text: `🏆 *SCRIM FINALIZADA*

👑 Ganador: @${winner.split('@')[0]}

🔥 Participantes: ${data.players.length}`,
                mentions: data.players
            }, { quoted: m })
        }

        // =========================
        // HELP
        // =========================
        return m.reply(`
🎮 *SCRIM SYSTEM*

.scrim start → iniciar
.scrim join → entrar
.scrim list → ver jugadores
.scrim end → finalizar (host)
        `)
    }
}

export default scrim
