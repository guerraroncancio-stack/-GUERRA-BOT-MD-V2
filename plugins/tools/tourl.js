import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

// =========================================
// 👑 GUERRA UPLOAD SYSTEM
// =========================================

async function uploadImage(buffer, fileName, mime) {

    const apis = [

        'https://api.dix.lat/upload1',

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

            const res =
            await fetch(api, {

                method: 'POST',

                body: form,

                headers: {

                    'User-Agent':
                    'GUERRA-UPLOAD'

                }

            })

            if (!res.ok) continue

            const json =
            await res.json()

            // =========================================
            // 📌 DIX API
            // =========================================

            if (

                json?.status &&
                json?.data?.url

            ) {

                return {

                    id:
                    json.data.id ||
                    'unknown',

                    url:
                    json.data.url,

                    size:
                    json.data.size ||
                    `${(
                        buffer.length /
                        1024 /
                        1024
                    ).toFixed(2)} MB`,

                    mime:
                    json.data.mime ||
                    mime

                }

            }

            // =========================================
            // 📌 TMPFILES
            // =========================================

            if (json?.data?.url) {

                return {

                    id:
                    'tmpfiles',

                    url:
                    json.data.url
                    .replace(
                        'tmpfiles.org/',
                        'tmpfiles.org/dl/'
                    ),

                    size:
                    `${(
                        buffer.length /
                        1024 /
                        1024
                    ).toFixed(2)} MB`,

                    mime

                }

            }

        } catch {}

    }

    return null

}

// =========================================
// 🚀 COMMAND
// =========================================

const uploadCommand = {

    name: 'upload',

    alias: [

        'tourl',
        'img',
        'imgurl'

    ],

    category: 'tools',

    cooldown: 3,

    async run(m, {
        conn,
        command
    }) {

        try {

            // =========================================
            // 📌 MESSAGE
            // =========================================

            const q =
            m.quoted
            ? m.quoted
            : m

            const mime =
            (q.msg || q).mimetype || ''

            // =========================================
            // ❌ NO IMAGE
            // =========================================

            if (

                !mime ||
                !mime.startsWith('image/')

            ) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA UPLOAD 👑 〕━━━⬣
┃
┃ ❌ Responde a una imagen
┃ usando:
┃
┃ ➥ .${command}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

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
            // 📂 TYPE
            // =========================================

            const type =
            await fileTypeFromBuffer(
                buffer
            )

            const ext =
            type?.ext || 'jpg'

            const fileName =

`guerra_${Date.now()}.${ext}`

            // =========================================
            // 🚀 UPLOAD
            // =========================================

            const result =
            await uploadImage(

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

`┏━━━〔 👑 GUERRA UPLOAD 👑 〕━━━⬣
┃
┃ ✅ Imagen subida
┃ correctamente
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 🆔 ID:
┃ ➥ ${result.id}
┃
┃ 📄 Archivo:
┃ ➥ ${fileName}
┃
┃ 📦 Peso:
┃ ➥ ${result.size}
┃
┃ 🧩 Tipo:
┃ ➥ ${result.mime}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 🌐 URL:
┃ ${result.url}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By:
┃ ➥ Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ SEND
            // =========================================

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

`┏━━━〔 ⚠️ GUERRA UPLOAD ⚠️ 〕━━━⬣
┃
┃ ❌ Error al subir
┃ la imagen.
┃
┃ 🔧 ${err.message}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default uploadCommand
