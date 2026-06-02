const scrims = global.scrims = global.scrims || {}

const scrim = {
    name: 'scrim',
    alias: ['torneo', 'match', 'custom'],
    category: 'games',

    run: async (m, { conn, text }) => {

        const chat = m.chat
        const cmd = (text || '').toLowerCase()

        scrims[chat] = scrims[chat] || {
            active: false,
            players: [],
            host: null,
            limit: 0
        }

        const data = scrims[chat]

        const jid = m.sender

        // =========================
        // START SCRIM
        // =========================
        if (cmd.startsWith('start')) {

            if (data.active) return m.reply('⚠️ Ya hay una scrim activa.')

            const limit = parseInt(cmd.split(' ')[1]) || 4 // default 4 jugadores

            data.active = true
            data.players = []
            data.host = jid
            data.limit = limit

            return conn.sendMessage(chat, {
                text: `🎮 *SCRIM ABIERTA*

👑 Host: @${jid.split('@')[0]}
👥 Límite: ${limit} jugadores

📌 Usa:
.scrim join → para entrar
.scrim list → ver jugadores`,
                mentions: [jid]
            }, { quoted: m })
        }

        // =========================
        // JOIN
        // =========================
        if (cmd === 'join') {

            if (!data.active) return m.reply('❌ No hay scrim activa.')

            if (data.players.includes(jid)) {
                return m.reply('⚠️ Ya estás registrado.')
            }

            if (data.players.length >= data.limit) {
                return m.reply('🚫 Scrim llena.')
            }

            data.players.push(jid)

            return conn.sendMessage(chat, {
                text: `✅ @${jid.split('@')[0]} se registró
👥 ${data.players.length}/${data.limit}`,
                mentions: [jid]
            }, { quoted: m })
        }

        // =========================
        // LIST
        // =========================
        if (cmd === 'list') {

            if (!data.active) return m.reply('❌ No hay scrim activa.')

            let txt = `🎮 *SCRIM LOBBY*\n\n`
            txt += `👑 Host: @${data.host.split('@')[0]}\n`
            txt += `👥 Jugadores: ${data.players.length}/${data.limit}\n\n`
            txt += `📋 *REGISTRADOS:*\n\n`

            if (!data.players.length) {
                txt += `— Aún no hay jugadores`
            } else {
                data.players.forEach((p, i) => {
                    txt += `#${i + 1} @${p.split('@')[0]}\n`
                })
            }

            return conn.sendMessage(chat, {
                text: txt,
                mentions: [data.host, ...data.players]
            }, { quoted: m })
        }

        // =========================
        // END SCRIM
        // =========================
        if (cmd === 'end') {

            if (!data.active) return m.reply('❌ No hay scrim activa.')

            if (jid !== data.host) {
                return m.reply('⚠️ Solo el host puede cerrar la scrim.')
            }

            data.active = false

            const winner = data.players.length
                ? data.players[Math.floor(Math.random() * data.players.length)]
                : null

            return conn.sendMessage(chat, {
                text: `🏆 *SCRIM FINALIZADA*

👑 Host: @${data.host.split('@')[0]}
🎮 Participantes: ${data.players.length}/${data.limit}
${winner ? `\n🥇 Ganador random: @${winner.split('@')[0]}` : ''}`,
                mentions: [data.host, ...data.players]
            }, { quoted: m })
        }

        // =========================
        // HELP
        // =========================
        return m.reply(`
🎮 *SCRIM PRO*

.scrim start <limite> → iniciar (ej: start 8)
.scrim join → registrarse
.scrim list → ver lobby
.scrim end → finalizar (host)
        `)
    }
}

export default scrim
