import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

// =========================================
// 👑 GUERRA DIX UPLOADER
// =========================================

async function uploadFile(buffer, fileName, mime) {

    const apis = [

        'https://api.dix.lat/upload2',

        'https://tmpfiles.org/api/v1/upload'

    ]

    for (const api of apis) {

        try {

            const form =
            new FormData()

            const blob =
            new Blob(
                [buffer],
                {
                    type: mime
                }
            )

            form.append(
                'file',
                blob,
                fileName
            )

            const res = await fetch(

                api,

                {
                    method: 'POST',
                    body: form
                }

            )

            if (!res.ok) continue

            const json =
            await res.json()

            // =========================================
            // 📌 DIX
            // =========================================

            if (

                json?.status &&
                json?.data?.url

            ) {

                return {

                    url:
                    json.data.url,

                    size:
                    json.data.size ||

                    `${(
                        buffer.length / 1024 / 1024
                    ).toFixed(2)} MB`

                }

            }

            // =========================================
            // 📌 TMPFILES
            // =========================================

            if (json?.data?.url) {

                return {

                    url:
                    json.data.url
                    .replace(
                        'tmpfiles.org/',
                        'tmpfiles.org/dl/'
                    ),

                    size:
                    `${(
                        buffer.length / 1024 / 1024
                    ).toFixed(2)} MB`

                }

            }

        } catch {}

    }

    return null

}

// =========================================
// 🚀 COMMAND
// =========================================

const dixCommand = {

    name: 'dix',

    alias: [

        'tourl',
        'upload',
        'imgurl'

    ],

    category: 'tools',

    cooldown: 3,

    async run(m, {
        conn
    }) {

        try {

            const q =
            m.quoted
            ? m.quoted
            : m

            const mime =
            (q.msg || q).mimetype || ''

            if (!mime) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA DIX 👑 〕━━━⬣
┃
┃ ❌ Responde a:
┃ 🖼️ Imagen
┃ 🎥 Video
┃ 🎵 Audio
┃ 📄 Documento
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

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
            // 📂 TYPE
            // =========================================

            const type =
            await fileTypeFromBuffer(
                buffer
            )

            const ext =
            type?.ext || 'bin'

            const fileName =

`guerra_${Date.now()}.${ext}`

            // =========================================
            // 🚀 UPLOAD
            // =========================================

            const result =
            await uploadFile(

                buffer,
                fileName,
                mime

            )

            if (!result) {

                throw new Error(
                    'Todas las APIs fallaron'
                )

            }

            // =========================================
            // 👑 DESIGN
            // =========================================

            const txt =

`┏━━━〔 👑 GUERRA DIX 👑 〕━━━⬣
┃
┃ ✅ Archivo subido
┃ exitosamente
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📄 Archivo:
┃ ➥ ${fileName}
┃
┃ 📦 Peso:
┃ ➥ ${result.size}
┃
┃ 🌐 URL:
┃ ➥ ${result.url}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By
┃ ➥ Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            await m.react('✅')

            return conn.sendMessage(

                m.chat,

                {
                    text: txt
                },

                {
                    quoted: m
                }

            )

        } catch (err) {

            console.error(err)

            await m.react('❌')

            return conn.reply(

                m.chat,

`┏━━━〔 ⚠️ GUERRA DIX ⚠️ 〕━━━⬣
┃
┃ ❌ Error al subir
┃ el archivo.
┃
┃ 🔧 ${err.message}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default dixCommand
