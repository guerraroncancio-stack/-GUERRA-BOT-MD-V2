import fetch from 'node-fetch'

const ffstats = {
    name: 'ffstats',
    alias: ['freefire', 'ff', 'statsff'],
    category: 'games',

    run: async (m, { conn, text }) => {

        const user = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

        const jid = (id) => {
            if (!id) return null
            if (typeof id !== 'string') return null
            if (!id.includes('@s.whatsapp.net')) return null
            return id
        }

        const target = jid(user)
        if (!target) return m.reply('❌ Usuario inválido.')

        const name = target.split('@')[0]

        // =========================
        // STATS ALEATORIAS (SIMULADAS)
        // =========================
        const kills = Math.floor(Math.random() * 5000)
        const wins = Math.floor(Math.random() * 1200)
        const matches = kills + Math.floor(Math.random() * 3000)
        const kd = (kills / (matches || 1)).toFixed(2)

        const level = Math.floor(Math.random() * 100)
        const rankList = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroico']
        const rank = rankList[Math.floor(Math.random() * rankList.length)]

        const headshots = Math.floor(Math.random() * 80)
        const accuracy = Math.floor(Math.random() * 100)

        // =========================
        // MENSAJE
        // =========================
        const msg = `
🎮 *FREE FIRE STATS*

👤 Jugador: @${name}

🏆 Nivel: ${level}
🔥 Rank: ${rank}

💀 Kills: ${kills}
🎯 Headshots: ${headshots}
📊 Partidas: ${matches}
🏅 Victorias: ${wins}

⚔️ K/D: ${kd}
🎯 Precisión: ${accuracy}%

💥 Estado: ${kd > 2 ? 'PRO PLAYER 🔥' : 'CASUAL PLAYER 🎮'}
`

        await conn.sendMessage(m.chat, {
            text: msg.trim(),
            mentions: [target]
        }, { quoted: m })
    }
}

export default ffstats
