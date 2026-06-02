const crush = {
    name: 'crush',
    alias: ['amor', 'pareja'],
    category: 'fun',
    group: true,

    run: async (m, { conn }) => {
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const participants = metadata.participants
                .map(v => v.id)
                .filter(v => !v.includes(conn.user.id.split('@')[0]))

            if (participants.length < 2) {
                return m.reply('❌ Se necesitan al menos 2 miembros.')
            }

            const user1 = participants[Math.floor(Math.random() * participants.length)]

            let user2
            do {
                user2 = participants[Math.floor(Math.random() * participants.length)]
            } while (user1 === user2)

            const porcentaje = Math.floor(Math.random() * 101)

            await conn.sendMessage(
                m.chat,
                {
                    text:
`╭─〔 💘 CRUSH DETECTADO 💘 〕─⬣
│
│ ❤️ Compatibilidad:
│ ${porcentaje}%
│
│ 👤 @${user1.split('@')[0]}
│ 💕
│ 👤 @${user2.split('@')[0]}
│
╰──────────────⬣`,
                    mentions: [user1, user2]
                },
                { quoted: m }
            )

        } catch (e) {
            console.error(e)
            m.reply('❌ Error al buscar un crush.')
        }
    }
}

export default crush
