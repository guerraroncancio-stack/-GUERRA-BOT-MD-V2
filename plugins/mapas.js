let mapasData = global.mapasData = global.mapasData || {}
let reactionRegistered = false

const mapasDefault = [
    'Bermuda 🏝️',
    'Purgatorio 🔥',
    'Kalahari 🏜️',
    'Alpine ❄️',
    'Nexterra 🌌'
]

const mapas = {
    name: 'mapas',
    alias: ['map', 'mapa', 'maps'],
    category: 'games',

    run: async (m, { conn, text }) => {

        if (!reactionRegistered) register(conn)

        const chat = m.chat

        const lista = mapasDefault

        const data = {
            chat,
            host: m.sender,
            votes: {},
            msgKey: null,
            active: true,
            maps: lista
        }

        const msg = await conn.sendMessage(chat, {
            text: render(lista),
            mentions: []
        }, { quoted: m })

        data.msgKey = msg.key
        mapasData[msg.key.id] = data
    }
}

export default mapas

// =========================
// UI
// =========================
function render(maps) {

    let txt = `🗺️ *SELECCIÓN DE MAPA*

📌 Reacciona para votar:

`

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

    maps.forEach((m, i) => {
        txt += `${emojis[i]} ${m}\n`
    })

    txt += `\n⚔️ El mapa con más votos será seleccionado automáticamente.`
    return txt
}

// =========================
// REACTIONS ENGINE
// =========================
function register(conn) {

    if (reactionRegistered) return
    reactionRegistered = true

    conn.ev.on('messages.upsert', async ({ messages }) => {

        for (const msg of messages) {

            if (!msg.message?.reactionMessage) continue

            const key = msg.message.reactionMessage.key
            const id = key.id

            const data = mapasData[id]
            if (!data) continue

            const user = msg.key.participant || msg.key.remoteJid
            if (!user) continue

            const emoji = normalize(msg.message.reactionMessage.text)

            const mapIndex = {
                '1️⃣': 0,
                '2️⃣': 1,
                '3️⃣': 2,
                '4️⃣': 3,
                '5️⃣': 4
            }[emoji]

            if (mapIndex === undefined) continue

            // =========================
            // GUARDAR VOTO (1 por usuario)
            // =========================
            data.votes[user] = mapIndex

            // =========================
            // CONTAR VOTOS
            // =========================
            const count = [0, 0, 0, 0, 0]

            Object.values(data.votes).forEach(v => {
                if (count[v] !== undefined) count[v]++
            })

            const newText = buildResult(data.maps, count)

            try {
                await conn.sendMessage(data.chat, {
                    text: newText,
                    edit: data.msgKey
                })
            } catch (e) {

                const sent = await conn.sendMessage(data.chat, {
                    text: newText,
                    mentions: Object.keys(data.votes)
                })

                data.msgKey = sent.key
                mapasData[sent.key.id] = data
            }
        }
    })
}

// =========================
// RESULT BUILDER
// =========================
function buildResult(maps, count) {

    let txt = `🗺️ *RESULTADO DE MAPA*\n\n`

    maps.forEach((m, i) => {
        txt += `${m} → ${count[i]} votos\n`
    })

    const winnerIndex = count.indexOf(Math.max(...count))

    txt += `\n🏆 *MAPA GANADOR:* ${maps[winnerIndex]}`
    return txt
}

function normalize(e = '') {
    return e.replace(/\uFE0F/g, '').trim()
}
