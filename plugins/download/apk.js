import axios from 'axios'
import fetch from 'node-fetch'

async function safeGet(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, { timeout: 20000 })
        } catch (e) {
            if (i === retries - 1) throw e
        }
    }
}

const apkCommand = {
    name: 'apk',
    alias: ['modapk', 'fdroid'],
    category: 'descargas',

    run: async (m, { conn, args }) => {
        const text = args.join(' ').trim()

        if (!text) {
            return conn.sendMessage(m.chat, {
                text: `╭━━〔 ⚠️ APK SEARCH 〕━━⬣
┃ ➤ Ingresa el nombre de la APK
┃ ➤ Ejemplo: .apk whatsapp
╰━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })
        }

        try {
            await m.react('⏳')

            // pequeña pausa anti-rate limit
            await new Promise(r => setTimeout(r, 1200))

            // 🔎 SEARCH
            const search = await safeGet(
                `https://sylphy.xyz/search/fdroid?q=${encodeURIComponent(text)}&api_key=sylphy-Lg4rAtj`
            )

            const results = search?.data?.result

            if (!search.data.status || !results?.length) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 APK SEARCH 〕━━⬣
┃ ➤ No se encontraron resultados
╰━━━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            const targetUrl = results[0].url

            // 🔽 DOWNLOAD INFO
            const download = await safeGet(
                `https://sylphy.xyz/download/fdroid?url=${encodeURIComponent(targetUrl)}&api_key=sylphy-Lg4rAtj`
            )

            const data = download?.data?.result

            if (!data || !data.apkUrl) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 ERROR APK 〕━━⬣
┃ ➤ No se pudo obtener el APK
╰━━━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            // validar link real
            const check = await fetch(data.apkUrl, { method: 'HEAD' }).catch(() => null)

            if (!check || !check.ok) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: `╭━━〔 LINK INVALIDO 〕━━⬣
┃ ➤ El APK no es descargable
┃ ➤ Fuente bloqueada o expirada
╰━━━━━━━━━━━━━━━━⬣`
                }, { quoted: m })
            }

            const txt = `╭━━〔 📦 APK DOWNLOADER 〕━━⬣
┃ ✦ Nombre: ${data.name}
┃ ✦ Versión: ${data.version}
┃ ✦ Info: ${data.summary}
╰━━━━━━━━━━━━━━━━━━⬣`

            await conn.sendMessage(m.chat, {
                document: { url: data.apkUrl },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${data.name}.apk`,
                caption: txt
            }, { quoted: m })

            await m.react('✅')

        } catch (e) {
            console.error(e)
            await m.react('❌')

            return conn.sendMessage(m.chat, {
                text: `╭━━〔 ERROR API 〕━━⬣
┃ ➤ ${e.message}
┃ ➤ Intenta más tarde
╰━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })
        }
    }
}

export default apkCommand
