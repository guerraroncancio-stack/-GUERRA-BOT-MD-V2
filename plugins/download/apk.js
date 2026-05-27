import axios from 'axios'

const apkCommand = {
    name: 'apk',
    alias: ['modapk', 'fdroid'],
    category: 'descargas',

    run: async (m, { conn, args }) => {
        const query = args.join(' ').trim()

        if (!query) {
            return conn.sendMessage(m.chat, {
                text: '*❒ Ingrese el nombre de la APK que desea buscar.*'
            }, { quoted: m })
        }

        try {
            await m.react('⏳')

            // 🔎 BUSQUEDA EN APKPURE (más estable que APIs random)
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`
            const res = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            })

            const html = res.data

            // 🔥 extraer primer resultado
            const match = html.match(/href="(\/[^"]+)" class="dd"/)

            if (!match) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: '*❒ No se encontraron resultados para esa APK.*'
                }, { quoted: m })
            }

            const appPath = match[1]
            const appUrl = `https://apkpure.com${appPath}`

            // 🔎 entrar a página de la app
            const appRes = await axios.get(appUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            })

            const appHtml = appRes.data

            const name = appHtml.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || 'APK'
            const desc = appHtml.match(/<meta name="description" content="(.*?)"/)?.[1] || 'Sin descripción'
            const downloadPage = appUrl + '/download'

            let txt = `╭━━━〔 📦 𝗔𝗣𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 〕━━━⬣\n`
            txt += `┃ ✦ 𝗣𝗟𝗔𝗧𝗔𝗙𝗢𝗥𝗠: APKPure Engine\n`
            txt += `┣━━━━━━━━━━━━━━━━━━━━━━⬣\n`
            txt += `┃ 📌 𝗡𝗢𝗠𝗕𝗥𝗘   : ${name}\n`
            txt += `┃ 🧾 𝗗𝗘𝗦𝗖      : ${desc}\n`
            txt += `┃ 🔗 𝗟𝗜𝗡𝗞     : ${appUrl}\n`
            txt += `┗━━━━━━━━━━━━━━━━━━━━━━⬣`

            await conn.sendMessage(m.chat, {
                text: txt,
                contextInfo: {
                    externalAdReply: {
                        title: name,
                        body: 'APK desde APKPure',
                        sourceUrl: appUrl,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m })

            await m.react('✅')

        } catch (e) {
            console.error(e)

            await m.react('❌')

            return conn.sendMessage(m.chat, {
                text: `❌ Error al buscar APK.\n\nDetalles: ${e.message}`
            }, { quoted: m })
        }
    }
}

export default apkCommand
