import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const uploadCommand = {

    name: 'upload',

    alias: [
        'tourl',
        'dix',
        'cdn'
    ],

    category: 'tools',

    cooldown: 3,

    async run(m, {
        conn,
        command
    }) {

        try {

            const q =
            m.quoted
            ? m.quoted
            : m

            const mime =
            (q.msg || q).mimetype || ''

            // =========================================
            // ❌ VALIDAR MEDIA
            // =========================================

            if (
                !mime ||
                !/image|video|audio/.test(mime)
            ) {

                return conn.reply(

                    m.chat,

`╭━━〔 ⚠️ GUERRA CDN ⚠️ 〕━━⬣
┃
┃ ✦ Responde a:
┃ ➥ Imagen
┃ ➥ Video
┃ ➥ Audio
┃
┃ ✦ Uso:
┃ ➥ .${command} respuesta
┃
╰━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

            // =========================================
            // ⏳ REACT
            // =========================================

            await m.react('📤')

            // =========================================
            // 📥 DOWNLOAD
            // =========================================

            const buffer =
            await q.download()

            if (!buffer) {

                throw new Error(
                    'No se pudo descargar'
                )

            }

            // =========================================
            // 📦 FILE INFO
            // =========================================

            const type =
            await fileTypeFromBuffer(buffer)

            const ext =
            type?.ext || 'bin'

            const fileName =
`guerra_${Date.now()}.${ext}`

            // =========================================
            // 📤 FORM DATA
            // =========================================

            const form =
            new FormData()

            const blob =
            new Blob(
                [buffer],
                {
                    type:
                    mime ||
                    'application/octet-stream'
                }
            )

            form.append(
                'file',
                blob,
                fileName
            )

           // =========================================
// 🌐 UPLOAD
// =========================================

let uploadedUrl = null
let provider = 'DIX CDN'

try {

    const response = await fetch(
        'https://cdn.dix.lat/upload',
        {
            method: 'POST',
            body: form,
            headers: {
                'User-Agent':
                'GUERRA-BOT-UPLOADER'
            }
        }
    )

    if (response.ok) {

        const json =
        await response.json()

        uploadedUrl =
            json?.data?.url ||
            json?.url ||
            null
    }

} catch {}

// =========================================
// 🔄 FALLBACK CATBOX
// =========================================

if (!uploadedUrl) {

    provider = 'CATBOX'

    const FormDataNode =
    (await import('form-data')).default

    const fallback =
    new FormDataNode()

    fallback.append(
        'reqtype',
        'fileupload'
    )

    fallback.append(
        'fileToUpload',
        buffer,
        fileName
    )

    const cat =
    await fetch(
        'https://catbox.moe/user/api.php',
        {
            method: 'POST',
            body: fallback
        }
    )

    const txt =
    await cat.text()

    if (
        txt &&
        txt.startsWith('http')
    ) {
        uploadedUrl = txt.trim()
    }
}

if (!uploadedUrl) {

    throw new Error(
        'No se pudo obtener URL'
    )
}

// =========================================
// 📱 TIPO
// =========================================

let mediaType = 'FILE'

if (mime.startsWith('image'))
    mediaType = 'IMAGE'

if (mime.startsWith('video'))
    mediaType = 'VIDEO'

if (mime.startsWith('audio'))
    mediaType = 'AUDIO'

// =========================================
// ✨ DISEÑO
// =========================================

const txt =

`╭━━〔 🚀 GUERRA CDN 🚀 〕━━⬣
┃
┃ ✦ Estado:
┃ ➥ Upload completado
┃
┃ ✦ Tipo:
┃ ➥ ${mediaType}
┃
┃ ✦ Formato:
┃ ➥ ${ext.toUpperCase()}
┃
┃ ✦ Archivo:
┃ ➥ ${fileName}
┃
┃ ✦ Servidor:
┃ ➥ ${provider}
┃
┃ ✦ URL:
┃ ➥ ${uploadedUrl}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 👑 Powered By:
┃ ➥ Kevin Guerra
╰━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ SEND
            // =========================================

            await conn.sendMessage(

                m.chat,

                {
                    text: txt
                },

                {
                    quoted: m
                }

            )

            await m.react('✅')

        } catch (err) {

            console.error(err)

            await m.react('❌')

            return conn.reply(

                m.chat,

`╭━━〔 ❌ GUERRA CDN ❌ 〕━━⬣
┃
┃ ✦ Error al subir
┃ ✦ Intenta nuevamente
┃
┃ ✦ Detalle:
┃ ➥ ${err.message}
┃
╰━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default uploadCommand
