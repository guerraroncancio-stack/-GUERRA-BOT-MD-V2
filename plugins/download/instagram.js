const instagram = {
    name: 'instagram',
    alias: ['ig', 'reels', 'reel'],
    category: 'descargas',
    run: async (m, { conn, args }) => {
        if (!args[0]) return m.reply(`╭━━〔 ⚠️ INSTAGRAM DL 〕━━⬣
┃ ❒ Ingresa un enlace de Instagram
╰━━━━━━━━━━━━━━⬣`)

        const regexInstagram = /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reels|reel|tv)\/[^\s]+$/i
        if (!regexInstagram.test(args[0])) return m.reply(`╭━━〔 ❌ ERROR 〕━━⬣
┃ ❒ Enlace de Instagram no válido
╰━━━━━━━━━━━━━━⬣`)

        try {
            if (m.react) await m.react("⏳")

            const res = await fetch(`https://sylphyy.xyz/download/instagram?url=${encodeURIComponent(args[0])}&api_key=sylphy-hz8pNip`)
            const json = await res.json()

            if (!json.status || !json.result?.length) throw new Error("No data")

            const video = json.result.find(url => url.includes('.mp4')) || json.result[1]
            if (!video) throw new Error("No video found")

            const caption = `╭━━〔 📥 INSTAGRAM DOWNLOADER 〕━━⬣
┃ ❒ Tipo: Post / Reel
┃ ❒ Link: ${args[0]}
╰━━━━━━━━━━━━━━⬣`

            await conn.sendMessage(m.chat, { 
                video: { url: video }, 
                caption 
            }, { quoted: m })

            if (m.react) await m.react("✅")

        } catch (e) {
            console.error(e)
            m.reply(`╭━━〔 ❌ ERROR INSTAGRAM 〕━━⬣
┃ ❒ No se pudo procesar el enlace
┃ ❒ Puede estar privado o eliminado
┃ ❒ Usa #report si el error persiste
╰━━━━━━━━━━━━━━⬣`)
        }
    }
}

export default instagram
