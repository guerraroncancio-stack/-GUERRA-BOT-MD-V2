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
            return m.reply(`⚔️ Usa:
.vs 1vs1
.vs 2vs2
.vs 4vs4`)
        }

        const limit = limits[mode]

        const data = {
            chat,
            mode,
            host: m.sender,
            teamA: [],
            teamB: [],
            msgId: null,
            active: true
        }

        const msg = await conn.sendMessage(chat, {
            text: render(mode, data.teamA, data.teamB),
            mentions: []
        }, { quoted: m })

        data.msgId = msg.key.id
        vsData[msg.key.id] = data
    }
}

export default vs

// =========================
// RENDER
// =========================
function render(mode, A, B) {

    const format = (arr, max) => {
        let out = ''
        for (let i = 0; i < max; i++) {
            out += arr[i]
                ? `👤 @${arr[i].split('@')[0]}\n`
                : `➖ vacío\n`
        }
        return out
    }

    const maxA = mode === '1vs1' ? 1 : mode === '2vs2' ? 2 : 4
    const maxB = maxA

    return `
⚔️ *VS ${mode.toUpperCase()}*

🅰️ EQUIPO A
${format(A, maxA)}

🅱️ EQUIPO B
${format(B, maxB)}

📌 Reacciona:
❤️ = Equipo A
👍 = Equipo B
👎 = salir
❌ = reset (admin)
`
}

// =========================
// REACTIONS
// =========================
function register(conn) {

    reactionRegistered = true

    conn.ev.on('messages.upsert', async ({ messages }) => {

        for (const msg of messages) {

            if (!msg.message?.reactionMessage) continue

            const id = msg.message.reactionMessage.key.id
            const data = vsData[id]
            if (!data) continue

            const user = msg.key.participant || msg.key.remoteJid
            const emoji = normalize(msg.message.reactionMessage.text)

            if (!user) continue

            // admin reset
            if (emoji === '❌' && user === data.host) {
                delete vsData[id]
                await conn.sendMessage(data.chat, {
                    text: '♻️ VS reiniciado por host'
                })
                continue
            }

            // remove user first
            data.teamA = data.teamA.filter(x => x !== user)
            data.teamB = data.teamB.filter(x => x !== user)

            const max = limits[data.mode]

            if (emoji === '❤️') {
                if (data.teamA.length < max.a) data.teamA.push(user)
            }

            if (emoji === '👍') {
                if (data.teamB.length < max.b) data.teamB.push(user)
            }

            // update message
            const newMsg = await conn.sendMessage(data.chat, {
                text: render(data.mode, data.teamA, data.teamB),
                mentions: [...data.teamA, ...data.teamB]
            })

            delete vsData[id]
            vsData[newMsg.key.id] = data
        }
    })
}

function normalize(e = '') {
    return e.replace(/\uFE0F/g, '').trim()
}
