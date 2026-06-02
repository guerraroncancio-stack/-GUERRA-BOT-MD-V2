const duelos = new Map()

const duelo = {
    name: 'duelo',
    alias: ['fight', 'pvp', 'batalla'],
    category: 'fun',

    run: async (m, { conn, text }) => {

        const jid = (id) => {
            if (!id) return null
            if (typeof id !== 'string') return null
            if (!id.includes('@s.whatsapp.net')) return null
            return id
        }

        const user1 = jid(m.sender)

        let user2 =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

        user2 = jid(user2)

        if (!user2 || user2 === user1) {
            return m.reply('⚔️ Uso:\n.duelo @usuario o responde a alguien')
        }

        // =========================
        // VIDA INICIAL
        // =========================
        let hp1 = 100
        let hp2 = 100

        const name1 = user1.split('@')[0]
        const name2 = user2.split('@')[0]

        let turn = Math.random() < 0.5 ? user1 : user2

        let msg = `⚔️ *INICIA EL DUELO*

👤 @${name1} vs @${name2}

💥 ¡Que empiece la batalla!`

        await conn.sendMessage(m.chat, {
            text: msg,
            mentions: [user1, user2]
        }, { quoted: m })

        // =========================
        // BATALLA
        // =========================
        while (hp1 > 0 && hp2 > 0) {

            await new Promise(r => setTimeout(r, 1200))

            const damage = Math.floor(Math.random() * 25) + 5

            if (turn === user1) {
                hp2 -= damage
                turn = user2
            } else {
                hp1 -= damage
                turn = user1
            }

            if (hp1 < 0) hp1 = 0
            if (hp2 < 0) hp2 = 0
        }

        // =========================
        // GANADOR
        // =========================
        const winner = hp1 > 0 ? user1 : user2
        const loser = hp1 > 0 ? user2 : user1

        const result = `
🏆 *RESULTADO DEL DUELO*

🥇 Ganador: @${winner.split('@')[0]}
💀 Perdedor: @${loser.split('@')[0]}

🔥 HP final:
- @${name1}: ${hp1}
- @${name2}: ${hp2}
`

        await conn.sendMessage(m.chat, {
            text: result,
            mentions: [user1, user2]
        }, { quoted: m })
    }
}

export default duelo
