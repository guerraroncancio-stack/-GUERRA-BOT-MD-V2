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

            const reaction = msg.message?.reactionMessage
            if (!reaction) continue

            // ⚠️ ID correcto del mensaje reaccionado
            const id = reaction.key?.id
            if (!id) continue

            const data = mapasData[id]
            if (!data) continue

            const user = msg.key.participant || msg.key.remoteJid
            if (!user) continue

            // ⚠️ EMOJI REAL (FIX IMPORTANTE)
            const emoji =
                reaction.text ||
                reaction.emoji ||
                reaction.reaction ||
                ''

            const clean = emoji.replace(/\uFE0F/g, '').trim()

            const index = emojis.indexOf(clean)
            if (index === -1) return

            // =========================
            // GUARDAR VOTO REAL
            // =========================
            data.votes[user] = index

            // =========================
            // RECONTAR
            // =========================
            const count = [0, 0, 0, 0, 0]

            for (const v of Object.values(data.votes)) {
                if (count[v] !== undefined) count[v]++
            }

            // =========================
            // EDITAR MENSAJE
            // =========================
            const newText = render(data.maps, count)

            try {
                await conn.sendMessage(data.chat, {
                    text: newText,
                    edit: data.msgKey
                })
            } catch (err) {

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
