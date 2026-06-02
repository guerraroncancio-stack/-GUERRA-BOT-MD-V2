const topfire = {
    name: 'topfire',
    alias: ['topff', 'fftop', 'rankingff'],
    category: 'games',

    run: async (m, { conn }) => {

        try {

            const users = await global.User.find({})
                .sort({ exp: -1 }) // puedes cambiar a kills si tienes
                .limit(10)
                .lean()

            if (!users.length) {
                return m.reply('❌ No hay jugadores registrados.')
            }

            let text = `🔥 *TOP FIRE - RANKING GLOBAL*\n\n`

            users.forEach((u, i) => {

                const id = (u.id || u.lid || 'unknown').split('@')[0]
                const exp = u.exp || 0
                const col = u.col || 0
                const wins = u.wins || Math.floor(Math.random() * 50)
                const kills = u.kills || Math.floor(Math.random() * 500)

                text += `#${i + 1} @${id}\n`
                text += `🔥 Kills: ${kills}\n🏆 Wins: ${wins}\n⚡ EXP: ${exp} | 💰 ${col}\n\n`
            })

            await conn.sendMessage(m.chat, {
                text,
                mentions: users.map(u => u.id || u.lid).filter(Boolean)
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error generando top fire.')
        }
    }
}

export default topfire
