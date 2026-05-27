import axios from 'axios'
import fetch from 'node-fetch'

const apkCommand = {
    name: 'apk',
    alias: ['modapk', 'fdroid'],
    category: 'descargas',

    run: async (m, { conn, args }) => {
        const text = args.join(' ').trim()

        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭─❒ ⚠️ ERROR\n│ ➤ Debes ingresar el nombre de la APK\n╰───────────────❒`
            }, { quoted: m })
        }

        try {
            await m.react('⏳')

            let searchRes
            try {
                searchRes = await axios.get(
                    `https://sylphy.xyz/search/fdroid?q=${encodeURIComponent(text)}&api_key=sylphy-Lg4rAtj`,
                    { timeout: 15000 }
                )
            } catch (e) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭─❒ ⚠️ API ERROR\n│ ➤ No se pudo conectar al servidor\n│ ➤ Intenta más tarde\n╰───────────────❒`
                }, { quoted: m })
            }

            const results = searchRes?.data?.result

            if (!searchRes.data.status || !results?.length) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭─❒ APK SEARCH\n│ ➤ No se encontraron resultados\n╰───────────────❒`
                }, { quoted: m })
            }

            const targetUrl = results[0].url

            let downloadRes
            try {
                downloadRes = await axios.get(
                    `https://sylphy.xyz/download/fdroid?url=${encodeURIComponent(targetUrl)}&api_key=sylphy-Lg4rAtj`,
                    { timeout: 15000 }
                )
            } catch (e) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭─❒ DESCARGA ERROR\n│ ➤ No se pudo obtener APK\n╰───────────────❒`
                }, { quoted: m })
            }

            const data = downloadRes?.data?.result
            if (!data) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭─❒ ERROR\n│ ➤ Datos inválidos de descarga\n╰───────────────❒`
                }, { quoted: m })
            }

            const resThumb = await fetch(data.icon)
            const thumbBuffer = Buffer.from(await resThumb.arrayBuffer())

            let txt = `
╭━━〔 📦 APK DOWNLOADER 〕━━⬣
┃ ✦ Nombre: ${data.name}
┃ ✦ Versión: ${data.version}
┃ ✦ Info: ${data.summary}
╰━━━━━━━━━━━━━━━━━━━━⬣
`.trim()

            await conn.sendMessage(m.chat, {
                document: { url: data.apkUrl },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${data.name}.apk`,
                caption: txt,
                contextInfo: {
                    externalAdReply: {
                        title: data.name,
                        body: '⬇️ Instalación lista',
                        thumbnail: thumbBuffer,
                        sourceUrl: data.apkUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            await m.react('✅')

        } catch (e) {
            console.error(e)
            await m.react('❌')

            return conn.sendMessage(m.chat, {
                text: `╭─❒ ERROR FATAL\n│ ➤ ${e.message}\n╰───────────────❒`
            }, { quoted: m })
        }
    }
}

export default apkCommand
