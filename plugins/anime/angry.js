import axios from 'axios'

const reaction = {
    emoji: '😡',
    txt_solo: '> ❒ @user1 está enojado con todo el grupo... 😡',
    txt_mencion: '> ❏ @user1 está enojado con @user2 😡',
    links: [
        'https://media.tenor.com/tx3x8ANgbBwAAAPo/the-dreaming-boy-is-a-realist-yumemiru-danshi.mp4',
        'https://media.tenor.com/pbqNBWOx6xUAAAPo/annoyed-anime-girl-annoyed.mp4',
        'https://media.tenor.com/cYRAeQqpaUMAAAPo/anime-angry-slow-loop.mp4',
        'https://media.tenor.com/hkoyf1VeaZ4AAAPo/anime-angry.mp4',
        'https://media.tenor.com/3oYh5_W_Fd8AAAPo/brat-annoying.mp4',
        'https://media.tenor.com/DGfqf7xX7YQAAAPo/leonardo-watch-leo.mp4',
        'httpss//media.tenor.com/Rxjl-XIiekMAAAPo/angry.mp4',
        'https://media.tenor.com/qiOZauqDU8gAAAPo/mad-angry.mp4',
        'https://media.tenor.com/9JjBiqaxzdAAAAPo/anime-angry.mp4',
        'https://media.tenor.com/U8vM8y9oJjUAAAPo/nisekoi-chitoge-kirisaki.mp4',
        'https://media.tenor.com/5hCo-bxm3mUAAAPo/gojo-gojo-annoyed.mp4',
        'https://media.tenor.com/z2iFD-hLYnAAAAPo/anime-girl-anime.mp4'
    ]
}

const angry = {
    name: 'angry',
    alias: ['enojado', 'angry'],
    category: 'interacciones',

    run: async (m, { conn }) => {
        try {
            if (!reaction.links.length) return

            const sender = m.sender?.split('@')[0]
            const target = m.mentionedJid?.[0]?.split('@')[0]
                || m.quoted?.sender?.split('@')[0]

            const user1 = `@${sender}`
            const user2 = target ? `@${target}` : null

            const mentions = [m.sender]
            let caption

            if (user2) {
                mentions.push(m.mentionedJid?.[0] || m.quoted?.sender)
                caption = reaction.txt_mencion
                    .replace(/@user1/g, user1)
                    .replace(/@user2/g, user2)
            } else {
                caption = reaction.txt_solo.replace(/@user1/g, user1)
            }

            if (m.react) await m.react(reaction.emoji)

            const video = reaction.links[
                Math.floor(Math.random() * reaction.links.length)
            ]

            await conn.sendMessage(m.chat, {
                video: { url: video },
                caption: `🔥 ${caption}`,
                gifPlayback: true,
                mentions,
                contextInfo: {
                    externalAdReply: {
                        title: '😡 Reacción Angry',
                        body: 'Sistema de interacciones',
                        previewType: 'PHOTO'
                    },
                    ...channelInfo
                }
            }, { quoted: m })

        } catch (err) {
            console.error('[ANGRY ERROR]', err)
        }
    }
}

export default angry
