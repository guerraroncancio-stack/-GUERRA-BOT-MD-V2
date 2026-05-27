import axios from 'axios'

const reaction = {
    emoji: '🥺',
    txt_solo: '╭─❒ @user1\n│ 🥺 Está triste...\n│ 💔 Necesita apoyo\n╰───────────────',
    txt_mencion: '╭─❏ @user1\n│ 🥺 Está triste por culpa de @user2\n│ 💔 Qué mal momento...\n╰───────────────',
    links: [
        'https://media.tenor.com/YS2hbVD4hGIAAAPo/anime-noragami.mp4',
        'https://media.tenor.com/qgEJTSRVKR4AAAPo/anime.mp4',
        'https://media.tenor.com/iSOANTCPvHYAAAPo/aestheic-black.mp4',
        'https://media.tenor.com/jotyiHEoUGUAAAPo/anime.mp4',
        'https://media.tenor.com/vEcyUvOTLI4AAAPo/adeus-volte-sempre.mp4',
        'https://media.tenor.com/VO2in_SxlvAAAAPo/sad-taiga-aisaka.mp4'
    ]
}

const sad = {
    name: 'sad',
    alias: ['sad', 'triste'],
    category: 'interacciones',

    run: async (m, { conn }) => {
        if (!reaction.links.length) return

        const user1 = m.sender
        const user2 = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)

        const name1 = '@' + user1.split('@')[0]
        const menciones = [user1]

        let textoFinal = ''

        if (user2) {
            menciones.push(user2)

            const name2 = '@' + user2.split('@')[0]

            textoFinal = reaction.txt_mencion
                .replace(/@user1/g, name1)
                .replace(/@user2/g, name2)

        } else {
            textoFinal = reaction.txt_solo.replace(/@user1/g, name1)
        }

        try {
            if (m.react) await m.react(reaction.emoji)

            const videoUrl = reaction.links[
                Math.floor(Math.random() * reaction.links.length)
            ]

            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: `🥺 𝗦𝗔𝗗 𝗠𝗢𝗗 💔\n\n${textoFinal}`,
                gifPlayback: true,
                mentions: menciones,
                contextInfo: {
                    ...channelInfo
                }
            }, { quoted: m })

        } catch (e) {
            console.error(e)
        }
    }
}

export default sad
