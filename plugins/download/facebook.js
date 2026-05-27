const facebook = {
    name: 'facebook',
    alias: ['fb', 'fbdl'],
    category: 'descargas',
    run: async (m, { conn, args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`╭━━〔 ⚠️ FACEBOOK DL 〕━━⬣
┃ ❒ Ingresa un enlace de Facebook
╰━━━━━━━━━━━━━━⬣`)

        const regexFacebook = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.gg)\/[^\s]+$/i
        if (!regexFacebook.test(args[0])) return m.reply(`╭━━〔 ❌ ERROR 〕━━⬣
┃ ❒ Enlace de Facebook no válido
╰━━━━━━━━━━━━━━⬣`)

        try {
            if (m.react) await m.react("⏳")

            const response = await fetch('https://panel.apinexus.fun/api/facebook/descargar', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-api-key': key
                },
                body: JSON.stringify({ url: args[0] })
            })
            
            const json = await response.json()

            if (!json.success || !json.data) throw new Error("No data found")

            const { titulo, hd, sd, media, type } = json.data

            if (type === 'image' || (media && media.length > 0 && !hd && !sd)) {
                const images = media || [json.data.url]

                for (const imgUrl of images) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: imgUrl }, 
                        caption: `╭━━〔 📸 FACEBOOK IMG 〕━━⬣
┃ ❒ ${titulo || 'Imagen de Facebook'}
╰━━━━━━━━━━━━━━⬣`
                    }, { quoted: m })
                }

                if (m.react) await m.react("✅")
                return
            }

            const videoUrl = hd || sd
            const quality = hd ? "HD 720p" : "SD"

            const caption = `╭━━〔 📥 FACEBOOK DOWNLOADER 〕━━⬣
┃ ❒ Título: ${titulo || "Video de Facebook"}
┃ ❒ Calidad: ${quality}
┃ ❒ Link: ${args[0]}
╰━━━━━━━━━━━━━━⬣`

            const videoRes = await fetch(videoUrl)
            const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
            const sizeMB = videoBuffer.length / (1024 * 1024)

            if (sizeMB > 80) {
                await conn.sendMessage(m.chat, { 
                    document: videoBuffer, 
                    caption,
                    fileName: `facebook.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { 
                    video: videoBuffer, 
                    caption,
                    fileName: `facebook.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m })
            }

            if (m.react) await m.react("✅")

        } catch (e) {
            console.error(e)
            if (m.react) await m.react("❌")
            m.reply(`╭━━〔 ❌ ERROR FACEBOOK 〕━━⬣
┃ ❒ No se pudo procesar el video
┃ ❒ Puede ser privado o expirado
┃ ❒ Usa #report si el error persiste
╰━━━━━━━━━━━━━━⬣`)
        }
    }
}

export default facebook
