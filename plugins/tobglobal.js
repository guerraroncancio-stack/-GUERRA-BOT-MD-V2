const topglobal = {
    name: 'topglobal',
    alias: ['top', 'ranking', 'leaderboard'],
    category: 'info',

    run: async (m, { conn }) => {

        try {

            // =========================
            // TRAER USUARIOS
            // =========================
            const users = await global.User.find({})
                .sort({ exp: -1 }) // puedes cambiar a col si quieres
                .limit(10)
                .lean()

            if (!users || !users.length) {
                return m.reply('❌ No hay datos de usuarios.')
            }

            // =========================
            // FORMATEAR TOP
            // =========================
            let text = `🏆 *TOP GLOBAL - RANKING*\n\n`

            users.forEach((u, i) => {
                const id = (u.id || u.lid || 'unknown').split('@')[0]
                const exp = u.exp || 0
                const col = u.col || 0

                text += `#${i + 1} @${id}\n`
                text += `⚡ EXP: ${exp} | 💰 Col: ${col}\n\n`
            })

            text += `📊 Total mostrados: ${users.length}`

            // =========================
            // MENSAJE
            // =========================
            await conn.sendMessage(m.chat, {
                text,
                mentions: users.map(u => u.id || u.lid).filter(Boolean)
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error generando top global.')
        }
    }
}

export default topglobal
