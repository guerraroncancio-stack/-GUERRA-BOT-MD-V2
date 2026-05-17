import axios from 'axios'

const reaction = {
    emoji: '🌙',
    txt_solo: '> ❒ @user1 le desea buenas noches a todos los integrantes del grupo..🌌',
    txt_mencion: '> ❏ @user1 le desea buenas noches a @user2  que descanses...🦉',
    links: [
'https://media.tenor.com/zFkXN9fQ_9oAAAPo/anya-sleep.mp4',
'https://media.tenor.com/jfwf7xpv5p0AAAPo/sleep-anime.mp4',
'https://media.tenor.com/zW-7t1j_GSEAAAPo/yu-goodnight-chat.mp4',
'https://media.tenor.com/g4_LOq_Vx-8AAAPo/sleepy-tired.mp4',
'https://media.tenor.com/08cBXuKC0L0AAAPo/bonne-nuit-bonne-nuit-anime.mp4',
'https://media.tenor.com/crYa4JHw9r0AAAPo/anime-good-night.mp4'
]
}

const nights = {
    name: 'nights',
    alias: ['noches', 'good_night', 'goodnight'],
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
            textoFinal = reaction.txt_mencion.replace(/@user1/g, name1).replace(/@user2/g, name2)
        } else {
            textoFinal = reaction.txt_solo.replace(/@user1/g, name1)
        }
        try {
            if (m.react) await m.react(reaction.emoji)
            const videoUrl = reaction.links[Math.floor(Math.random() * reaction.links.length)]
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: textoFinal,
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

export default nights;