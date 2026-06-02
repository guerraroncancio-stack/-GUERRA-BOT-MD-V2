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

        const chat = m.chat
        const mode = (text || '').toLowerCase()

        if (!limits[mode]) {
            return m.reply(`⚔️ Usa:\n.vs 1vs1\n.vs 2vs2\n.vs 4vs4`)
        }

        const data = {
            chat,
            mode,
            host: m.sender,
            teamA: [],
            teamB: [],
            active: true,
            msgKey: null // 🔥 CLAVE REAL
        }

        const msg = await conn.sendMessage(chat, {
            text: render(mode, data.teamA, data.teamB),
            mentions: []
        }, { quoted: m })

        // 🔥 GUARDAMOS EL MENSAJE REAL
        data.msgKey = msg.key

        vsData[msg.key.id] = data
    }
}

export default vs

// =========================
// RENDER
// =========================
function render(mode, A, B) {

    const maxA = mode === '1vs1' ? 1 : mode === '2vs2' ? 2 : 4
    const maxB = maxA

    const format = (arr, max) => {
        let out = ''
        for (let i = 0; i < max; i++) {
            out += arr[i]
                ? `👤 @${arr[i].split('@')[0]}\n`
                : `➖ vacío\n`
        }
        return out
    }

    return `
⚔️ *VS ${mode.toUpperCase()}*

🅰️ EQUIPO A
${format(A, maxA)}

🅱️ EQUIPO B
${format(B, maxB)}

📌 ❤️ = A | 👍 = B | 👎 = salir | ❌ = reset
`
}

// =========================
// REACTIONS FIXED
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

            const emojiRaw = msg.message.reactionMessage.text || ''
            const emoji = normalize(emojiRaw)

            const max = limits[data.mode]

            // ❌ RESET
            if (emoji === '❌' && user === data.host) {
                delete vsData[id]
                await conn.sendMessage(data.chat, {
                    text: '♻️ VS reiniciado por host'
                })
                continue
            }

            // =========================
            // LIMPIAR USER
            // =========================
            data.teamA = data.teamA.filter(x => x !== user)
            data.teamB = data.teamB.filter(x => x !== user)

            // =========================
            // ENTRADA
            // =========================
            if (emoji === '❤️') {
                if (data.teamA.length < max.a) data.teamA.push(user)
            }

            if (emoji === '👍') {
                if (data.teamB.length < max.b) data.teamB.push(user)
            }

            if (emoji === '👎') {
                // salir
            }

            // =========================
            // 🔥 EDIT REAL DEL MENSAJE ORIGINAL
            // =========================
            try {
                await conn.sendMessage(data.chat, {
                    text: render(data.mode, data.teamA, data.teamB),
                    edit: data.msgKey   // 🔥 ESTO ES LO CORRECTO
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

function normalize(e = '') {
    return e.replace(/\uFE0F/g, '').trim()
}
