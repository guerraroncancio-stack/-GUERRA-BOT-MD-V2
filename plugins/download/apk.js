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
                text: `╭━━〔 ⚠️ ERROR 〕━━⬣
┃ ➤ Debes ingresar el nombre de la APK
┃ ➤ Ejemplo: .apk whatsapp
╰━━━━━━━━━━━━━━⬣`
            }, { quoted: m })
        }

        try {
            await m.react('⏳')

            const search = await axios.get(
                `https://sylphy.xyz/search/fdroid?q=${encodeURIComponent(text)}&api_key=sylphy-Lg4rAtj`,
                { timeout: 15000 }
            )

            const results = search?.data?.result

            if (!search.data.status || !results?.length) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 APK SEARCH 〕━━⬣
┃ ➤ No se encontraron resultados
╰━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            const targetUrl = results[0].url

            const download = await axios.get(
                `https://sylphy.xyz/download/fdroid?url=${encodeURIComponent(targetUrl)}&api_key=sylphy-Lg4rAtj`,
                { timeout: 15000 }
            )

            const data = download?.data?.result

            if (!data || !data.apkUrl) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 ERROR 〕━━⬣
┃ ➤ No se pudo obtener el APK
╰━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            const apkUrl = data.apkUrl

            // validar link real
            const check = await fetch(apkUrl, { method: 'HEAD' }).catch(() => null)

            if (!check || !check.ok) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 LINK BLOQUEADO 〕━━⬣
┃ ➤ El APK no es descargable
┃ ➤ Fuente protegida o expirada
╰━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            let txt = `╭━━〔 📦 APK DOWNLOADER 〕━━⬣
┃ ✦ Nombre: ${data.name}
┃ ✦ Versión: ${data.version}
┃ ✦ Info: ${data.summary}
╰━━━━━━━━━━━━━━━━━━━━⬣`

            await conn.sendMessage(m.chat, {
                document: { url: apkUrl },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${data.name}.apk`,
                caption: txt
            }, { quoted: m })

            await m.react('✅')

        } catch (e) {
            console.error(e)
            await m.react('❌')

            return conn.sendMessage(m.chat, {
                text: `╭━━〔 ERROR FATAL 〕━━⬣
┃ ➤ ${e.message}
╰━━━━━━━━━━━━━━⬣`
            }, { quoted: m })
        }
    }
}

export default apkCommand
