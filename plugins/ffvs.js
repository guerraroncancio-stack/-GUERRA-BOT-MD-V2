const vsclan = global.vsclan = global.vsclan || {}

const vs = {
    name: 'vs',
    alias: ['clanvs', 'war', 'guerra'],
    category: 'games',

    run: async (m, { conn, text }) => {

        const chat = m.chat
        const jid = m.sender

        vsclan[chat] = vsclan[chat] || {
            active: false,
            playersA: [],
            playersB: [],
            host: null,
            limit: 4,
            msgKey: null,
            stage: 'wait'
        }

        const data = vsclan[chat]

        const cmd = (text || '').toLowerCase()

        // =========================
        // START VS
        // =========================
        if (cmd.startsWith('start')) {

            if (data.active) return m.reply('⚠️ Ya hay una guerra activa.')

            const limit = parseInt(cmd.split(' ')[1]) || 4

            data.active = true
            data.host = jid
            data.limit = limit
            data.playersA = []
            data.playersB = []
            data.stage = 'joinA'

            const msg = await conn.sendMessage(chat, {
                text: `
⚔️ *VS CLAN INICIADO*

👑 Host: @${jid.split('@')[0]}
📊 Límite por equipo: ${limit}

🅰️ EQUIPO A: REACCIONA ⚔️ PARA ENTRAR

📌 Reacciona al mensaje para unirte al Equipo A
                `,
                mentions: [jid]
            }, { quoted: m })

            data.msgKey = msg.key

            return
        }

        // =========================
        // JOIN MANUAL (fallback)
        // =========================
        if (cmd === 'join') {

            if (!data.active) return m.reply('❌ No hay guerra activa.')

            if (data.playersA.includes(jid) || data.playersB.includes(jid)) {
                return m.reply('⚠️ Ya estás registrado.')
            }

            if (data.stage === 'joinA') {

                if (data.playersA.length >= data.limit) {
                    data.stage = 'joinB'
                    return m.reply('🅰️ Equipo A lleno. Ahora Equipo B.')
                }

                data.playersA.push(jid)

            } else {

                if (data.playersB.length >= data.limit) {
                    return m.reply('🚫 Ambos equipos llenos.')
                }

                data.playersB.push(jid)
            }

            return conn.sendMessage(chat, {
                text: `⚔️ @${jid.split('@')[0]} se unió al VS`,
                mentions: [jid]
            }, { quoted: m })
        }

        // =========================
        // LISTA
        // =========================
        if (cmd === 'list') {

            if (!data.active) return m.reply('❌ No hay guerra activa.')

            let txt = `
⚔️ *VS CLAN LOBBY*

🅰️ Equipo A (${data.playersA.length}/${data.limit})
${data.playersA.map((p, i) => `#${i + 1} @${p.split('@')[0]}`).join('\n') || '— vacío'}

\n🅱️ Equipo B (${data.playersB.length}/${data.limit})
${data.playersB.map((p, i) => `#${i + 1} @${p.split('@')[0]}`).join('\n') || '— vacío'}
`

            return conn.sendMessage(chat, {
                text: txt,
                mentions: [...data.playersA, ...data.playersB]
            }, { quoted: m })
        }

        // =========================
        // END
        // =========================
        if (cmd === 'end') {

            if (!data.active) return m.reply('❌ No hay guerra activa.')
            if (jid !== data.host) return m.reply('⚠️ Solo el host puede finalizar.')

            const allA = data.playersA
            const allB = data.playersB

            const winnerTeam = Math.random() < 0.5 ? 'A' : 'B'
            const winners = winnerTeam === 'A' ? allA : allB

            data.active = false

            return conn.sendMessage(chat, {
                text: `
🏆 *RESULTADO VS CLAN*

🥇 Ganador: Equipo ${winnerTeam}

🅰️ A: ${allA.length} jugadores
🅱️ B: ${allB.length} jugadores

🔥 Ganadores:
${winners.map(p => `@${p.split('@')[0]}`).join('\n')}
                `,
                mentions: [...allA, ...allB]
            }, { quoted: m })
        }

        // =========================
        // HELP
        // =========================
        return m.reply(`
⚔️ *VS CLAN SYSTEM*

.vs start <limite> → iniciar
.vs join → entrar manual
.vs list → ver equipos
.vs end → finalizar
        `)
    }
}

export default vs
