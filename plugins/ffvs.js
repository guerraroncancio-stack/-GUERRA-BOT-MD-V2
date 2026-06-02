let vsData = global.vsData = global.vsData || {}
let reactionRegistered = false

const limits = {
    '1vs1': { a: 1, b: 1 },
    '2vs2': { a: 2, b: 2 },
    '4vs4': { a: 4, b: 4 }
}

const vs = {
    name: 'vs',
    alias: ['versus', 'war', 'clanvs'],
    category: 'games',

    run: async (m, { conn, text }) => {

        if (!reactionRegistered) register(conn)

        const mode = (text || '').toLowerCase()
        if (!limits[mode]) {
            return m.reply(`⚔️ Usa:\n.vs 1vs1\n.vs 2vs2\n.vs 4vs4`)
        }

        const data = {
            chat: m.chat,
            mode,
            host: m.sender,
            teamA: [],
            teamB: [],
            msgKey: null,
            locked: false
        }

        const msg = await conn.sendMessage(m.chat, {
            text: render(mode, data.teamA, data.teamB),
            mentions: []
        }, { quoted: m })

        data.msgKey = msg.key
        vsData[msg.key.id] = data
    }
}

export default vs

// =========================
// RENDER UI
// =========================
function render(mode, A, B) {

    const max = limits[mode]

    const format = (arr, size) => {
        let out = ''
        for (let i = 0; i < size; i++) {
            out += arr[i]
                ? `👤 @${arr[i].split('@')[0]}\n`
                : `➖ vacío\n`
        }
        return out
    }

    return `
⚔️ *VS ESPORTS ${mode.toUpperCase()}*

🅰️ EQUIPO A
${format(A, max.a)}

🅱️ EQUIPO B
${format(B, max.b)}

📌 Reacciona:
❤️ = Equipo A
👍 = Equipo B
👎 = salir
❌ = reset (host)
`
}

// =========================
// REACTION ENGINE (PRO)
// =========================
function register(conn) {

    if (reactionRegistered) return
    reactionRegistered = true

    conn.ev.on('messages.upsert', async ({ messages }) => {

        for (const msg of messages) {

            if (!msg.message?.reactionMessage) continue

            const key = msg.message.reactionMessage.key
            const id = key.id

            const data = vsData[id]
            if (!data) continue

            const user = msg.key.participant || msg.key.remoteJid
            if (!user) continue

            const emoji = normalize(msg.message.reactionMessage.text)

            const max = limits[data.mode]

            // =========================
            // RESET SOLO HOST
            // =========================
            if (emoji === '❌' && user === data.host) {
                delete vsData[id]
                await conn.sendMessage(data.chat, {
                    text: '♻️ VS reiniciado por host'
                })
                continue
            }

            // =========================
            // LIMPIEZA ANTI DUPLICADOS
            // =========================
            data.teamA = data.teamA.filter(x => x !== user)
            data.teamB = data.teamB.filter(x => x !== user)

            // =========================
            // FIX ❤️ UNICODE REAL
            // =========================
            const isHeart = emoji.includes('❤')

            if (isHeart) {
                if (data.teamA.length < max.a) data.teamA.push(user)
            }

            if (emoji === '👍') {
                if (data.teamB.length < max.b) data.teamB.push(user)
            }

            if (emoji === '👎') {
                // salir (ya limpiado arriba)
            }

            // =========================
            // 🔥 EDIT SAFE (SIN SPAM)
            // =========================
            try {
                await conn.sendMessage(data.chat, {
                    text: render(data.mode, data.teamA, data.teamB),
                    edit: data.msgKey
                })
            } catch (e) {

                // fallback seguro
                const sent = await conn.sendMessage(data.chat, {
                    text: render(data.mode, data.teamA, data.teamB),
                    mentions: [...data.teamA, ...data.teamB]
                })

                data.msgKey = sent.key
                vsData[sent.key.id] = data
            }
        }
    })
}

// =========================
// NORMALIZER (CRÍTICO)
// =========================
function normalize(e = '') {
    return e.replace(/\uFE0F/g, '').trim()
}
