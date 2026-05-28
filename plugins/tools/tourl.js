import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

// =========================================
// 👑 GUERRA UPLOAD
// =========================================

async function uploadToDix(buffer, fileName, mime) {

    const endpoints = [

        'https://api.dix.lat/upload1',

        'https://api.dix.lat/upload2'

    ]

    for (const api of endpoints) {

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
                    'GUERRA-UPLOADER'

                }

            })

            if (!res.ok) {

                console.log(
                    `HTTP ${res.status}`
                )

                continue

            }

            const json =
            await res.json()

            // =========================================
            // ✅ VALID RESPONSE
            // =========================================

            if (

                json?.status &&
                json?.data?.url

            ) {

                const result =
                json.data

                // =========================================
                // 🔥 DIRECT IMAGE URL
                // =========================================

                let finalUrl =
                result.url

                // fuerza extensión si no tiene

                if (
                    !/\.(jpg|jpeg|png|webp|gif)$/i
                    .test(finalUrl)
                ) {

                    finalUrl +=
                    `.${fileName.split('.').pop()}`

                }

                return {

                    id:
                    result.id ||
                    'unknown',

                    url:
                    finalUrl,

                    size:
                    result.size ||
                    `${(
                        buffer.length /
                        1024 /
                        1024
                    ).toFixed(2)} MB`,

                    mime:
                    result.mime ||
                    mime

                }

            }

        } catch (e) {

            console.log(e)

        }

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
            await uploadToDix(

                buffer,
                fileName,
                mime

            )

            if (!result) {

                throw new Error(
                    'La API no devolvió URL'
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

        } catch (e) {

            console.error(e)

            await m.react('❌')

            return conn.reply(

                m.chat,

`┏━━━〔 ⚠️ GUERRA UPLOAD ⚠️ 〕━━━⬣
┃
┃ ❌ Error al subir
┃ la imagen.
┃
┃ 🔧 ${e.message}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default uploadCommand
