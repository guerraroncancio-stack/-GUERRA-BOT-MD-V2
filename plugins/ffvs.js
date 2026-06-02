const vs = {
    name: 'vs',
    alias: ['versus', 'fight', '1v1'],
    category: 'games',

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
            return m.reply('⚔️ Uso:\n.vs @usuario o responde a alguien')
        }

        const name1 = user1.split('@')[0]
        const name2 = user2.split('@')[0]

        // =========================
        // STATS INICIALES
        // =========================
        let hp1 = 100
        let hp2 = 100

        let msg = `
⚔️ *VERSUS INICIADO*

👤 @${name1} VS @${name2}

🔥 ¡La batalla comienza!
`

        await conn.sendMessage(m.chat, {
            text: msg,
            mentions: [user1, user2]
        }, { quoted: m })

        // =========================
        // SIMULACIÓN DE PELEA
        // =========================
        while (hp1 > 0 && hp2 > 0) {

            await new Promise(r => setTimeout(r, 900))

            const damage1 = Math.floor(Math.random() * 20) + 5
            const damage2 = Math.floor(Math.random() * 20) + 5

            hp1 -= damage1
            hp2 -= damage2

            if (hp1 < 0) hp1 = 0
            if (hp2 < 0) hp2 = 0
        }

        // =========================
        // RESULTADO
        // =========================
        const winner = hp1 > hp2 ? user1 : user2
        const loser = hp1 > hp2 ? user2 : user1

        const result = `
🏆 *RESULTADO VS*

🥇 Ganador: @${winner.split('@')[0]}
💀 Perdedor: @${loser.split('@')[0]}

📊 HP final:
- @${name1}: ${hp1}
- @${name2}: ${hp2}

🔥 ¡Batalla terminada!
`

        await conn.sendMessage(m.chat, {
            text: result,
            mentions: [user1, user2]
        }, { quoted: m })
    }
}

export default vs
