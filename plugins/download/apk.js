import axios from 'axios'
import fetch from 'node-fetch'

const safeGet = async (url, options = {}, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await axios.get(url, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Accept': 'application/json, text/plain, */*'
                },
                ...options
            })
            return res.data
        } catch (e) {
            if (i === retries) throw e
        }
    }
}

const apkCommand = {
    name: 'apk',
    alias: ['modapk', 'fdroid'],
    category: 'descargas',

    run: async (m, { conn, args }) => {
        const text = args.join(' ')
        if (!text) {
            return conn.sendMessage(m.chat, {
                text: '┏━━━━━━━━━━━━━━━┓\n┃ ⚠️ INGRESA EL NOMBRE\n┗━━━━━━━━━━━━━━━┛'
            }, { quoted: m })
        }

        try {
            await m.react('⏳')

            const search = await safeGet(
                `https://sylphy.xyz/search/fdroid?q=${encodeURIComponent(text)}&api_key=sylphy-Lg4rAtj`
            )

            if (!search?.status || !search?.result?.length) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: '┏━━━━━━━━━━━━━━━┓\n┃ ❌ NO SE ENCONTRÓ APK\n┗━━━━━━━━━━━━━━━┛'
                }, { quoted: m })
            }

            const url = search.result[0].url

            const download = await safeGet(
                `https://sylphy.xyz/download/fdroid?url=${encodeURIComponent(url)}&api_key=sylphy-Lg4rAtj`
            )

            if (!download?.status || !download?.result) {
                await m.react('❌')
                return conn.sendMessage(m.chat, {
                    text: '┏━━━━━━━━━━━━━━━┓\n┃ ❌ ERROR EN DESCARGA\n┗━━━━━━━━━━━━━━━┛'
                }, { quoted: m })
            }

            const data = download.result

            const iconBuffer = await fetch(data.icon)
                .then(r => r.arrayBuffer())
                .then(b => Buffer.from(b))
                .catch(() => null)

            const txt =
`┏━━━━━━━━━━━━━━━━━━━┓
┃ 📦 APK DOWNLOADER
┣━━━━━━━━━━━━━━━━━━━
┃ 📌 Nombre: ${data.name}
┃ 🔖 Versión: ${data.version}
┃ 📝 Info: ${data.summary}
┗━━━━━━━━━━━━━━━━━━━┛`

            await conn.sendMessage(m.chat, {
                document: { url: data.apkUrl },
                fileName: `${data.name}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: txt,
                contextInfo: {
                    externalAdReply: {
                        title: data.name,
                        body: 'APK Downloader',
                        thumbnail: iconBuffer || undefined,
                        sourceUrl: data.apkUrl,
                        mediaType: 1
                    }
                }
            }, { quoted: m })

            await m.react('✅')

        } catch (err) {
            console.error('APK ERROR:', err?.message || err)
            await m.react('❌')

            return conn.sendMessage(m.chat, {
                text: '┏━━━━━━━━━━━━━━━┓\n┃ ⚠️ ERROR API / BLOQUEO\n┃ 🔁 INTENTA MÁS TARDE\n┗━━━━━━━━━━━━━━━┛'
            }, { quoted: m })
        }
    }
}

export default apkCommand
