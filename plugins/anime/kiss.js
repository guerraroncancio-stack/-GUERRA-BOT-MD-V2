import axios from 'axios'

const reaction = {
    emoji: '😘',
    txt_solo: '╭─❒ @user1\n│ 😘 Se dio un beso a sí mismo/a...\n╰───────────────',
    txt_mencion: '╭─❏ @user1\n│ 😘 Le dio un beso a @user2\n╰───────────────',
    links: [
        'https://media.tenor.com/kmxEaVuW8AoAAAPo/kiss-gentle-kiss.mp4',
        'https://media.tenor.com/_8oadF3hZwIAAAPo/kiss.mp4',
        'https://media.tenor.com/sbMBW4a-VN4AAAPo/anime-kiss.mp4',
        'https://media.tenor.com/YHxJ9NvLYKsAAAPo/anime-kiss.mp4',
        'https://media.tenor.com/9u2vmryDP-cAAAPo/horimiya-animes.mp4',
        'https://media.tenor.com/xDCr6DNYcZEAAAPo/sealyx-frieren-beyond-journey%27s-end.mp4',
        'https://media.tenor.com/1fNT0SY5cjwAAAPo/nene-nene-amano.mp4',
        'https://media.tenor.com/ZDqsYLDQzIUAAAPo/shirayuki-zen-kiss-anime.mp4',
        'https://media.tenor.com/lJPu85pBQLEAAAPo/kiss.mp4',
        'https://media.tenor.com/_JqioiurJwIAAAPo/amor-anime-kiss.mp4',
        'https://media.tenor.com/JmphmnN1y3kAAAPo/kiss.mp4'
    ]
}

const kiss = {
    name: 'kiss',
    alias: ['beso', 'kiss'],
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
                caption: `😘 𝗞𝗜𝗦𝗦 𝗠𝗢𝗗 💕\n\n${textoFinal}`,
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

export default kiss
