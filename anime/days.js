import axios from 'axios'

const reaction = {
    emoji: '⛅',
    txt_solo: '> ❒ @user1 le desea buenos días al grupo..🌞',
    txt_mencion: '> ❏ @user1 le dice buenos días a @user2  ¿como estas?🌅',
    links: [
'https://media.tenor.com/txLMlBK8DZEAAAPo/anime-wave.mp4',
'https://media.tenor.com/oFIVahMtgnwAAAPo/anime-anime-good-morning.mp4',
'https://media.tenor.com/ZEOi6sEqzqQAAAPo/miku-hatsune-miku.mp4',
'https://media.tenor.com/7DaNzCh9330AAAPo/coffee-edited.mp4',
'https://media.tenor.com/vs2Pr8cyB20AAAPo/good-morning-chat-totoro.mp4',
'https://media.tenor.com/WxSihDpeY1YAAAPo/revolution-of-royales-ror.mp4'
]
}

const days = {
    name: 'days',
    alias: ['good_morning', 'goodmorning'],
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

export default days;