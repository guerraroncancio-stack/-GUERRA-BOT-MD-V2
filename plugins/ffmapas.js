let mapasData = global.mapasData = global.mapasData || {}
let reactionRegistered = false

const mapasDefault = [
    'Bermuda 🏝️',
    'Purgatorio 🔥',
    'Kalahari 🏜️',
    'Alpine ❄️',
    'Nexterra 🌌'
]

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

const mapas = {
    name: 'mapas',
    alias: ['map', 'maps'],
    category: 'games',

    run: async (m, { conn }) => {

        if (!reactionRegistered) register(conn)

        const msg = await conn.sendMessage(m.chat, {
            text: render(mapasDefault, {}),
            mentions: []
        }, { quoted: m })

        mapasData[msg.key.id] = {
            chat: m.chat,
            msgKey: msg.key,
            votes: {},   // user => index
            maps: mapasDefault
        }
    }
}

export default mapas

// =========================
// UI
// =========================
function render(maps, count) {

    let txt = `🗺️ *VOTACIÓN DE MAPAS*

📌 Reacciona:

`

    maps.forEach((m, i) => {
        txt += `${emojis[i]} ${m} | 🗳️ ${count[i] || 0} votos\n`
    })

    txt += `\n⚔️ Puedes cambiar tu voto en cualquier momento.`
    return txt
}

// =========================
// ENGINE REACCIONES
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

            const index = emojis.indexOf(emoji)
            if (index === -1) continue

            // =========================
            // GUARDAR / CAMBIAR VOTO
            // =========================
            data.votes[user] = index

            // =========================
            // RECONTAR VOTOS REALES
            // =========================
            const count = [0, 0, 0, 0, 0]

            Object.values(data.votes).forEach(v => {
                if (count[v] !== undefined) count[v]++
            })

            // =========================
            // ACTUALIZAR MENSAJE
            // =========================
            const newText = render(data.maps, count)

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

function normalize(e = '') {
    return e.replace(/\uFE0F/g, '').trim()
}
