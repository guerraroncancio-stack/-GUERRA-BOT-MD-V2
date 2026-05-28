import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

// =========================================
// 👑 GUERRA DIX UPLOADER
// =========================================

async function uploadToDix(buffer, fileName, mime) {

    try {

        const form = new FormData()

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

            'https://api.dix.lat/upload2',

            {
                method: 'POST',

                body: form,

                headers: {

                    'User-Agent':
                    'GUERRA-BOT-UPLOADER'

                }

            }

        )

        if (!res.ok) {

            throw new Error(
                `HTTP ${res.status}`
            )

        }

        const json =
        await res.json()

        if (

            !json ||
            !json.status ||
            !json.data

        ) {

            throw new Error(
                'Respuesta inválida'
            )

        }

        return json.data

    } catch (err) {

        console.error(err)

        return null

    }

}

// =========================================
// 🚀 COMMAND
// =========================================

const dixCommand = {

    name: 'dix',

    alias: [

        'tourl',
        'tourl2',
        'upload',
        'imgurl'

    ],

    category: 'tools',

    cooldown: 3,

    async run(m, {
        conn
    }) {

        try {

            // =========================================
            // 📌 QUOTED
            // =========================================

            const q =
            m.quoted
            ? m.quoted
            : m

            const mime =
            (q.msg || q).mimetype || ''

            // =========================================
            // ❌ NO MEDIA
            // =========================================

            if (!mime) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA DIX 👑 〕━━━⬣
┃
┃ ❌ Responde a un:
┃
┃ 🖼️ Imagen
┃ 🎥 Video
┃ 🎵 Audio
┃ 📄 Documento
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
            // 📂 FILE TYPE
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
            await uploadToDix(

                buffer,
                fileName,
                mime

            )

            // =========================================
            // ❌ ERROR API
            // =========================================

            if (

                !result ||
                !result.url

            ) {

                throw new Error(
                    'La API no devolvió URL'
                )

            }

            // =========================================
            // 📊 INFO
            // =========================================

            const size =

            result.size ||
            `${(
                buffer.length / 1024 / 1024
            ).toFixed(2)} MB`

            const finalMime =

            result.mime ||
            mime

            // =========================================
            // 👑 DESIGN
            // =========================================

            const txt =

`┏━━━〔 👑 GUERRA DIX 👑 〕━━━⬣
┃
┃ ✅ Archivo subido
┃ correctamente
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📄 Nombre:
┃ ➥ ${fileName}
┃
┃ 📦 Peso:
┃ ➥ ${size}
┃
┃ 🧩 Tipo:
┃ ➥ ${finalMime}
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

`┏━━━〔 ⚠️ GUERRA DIX ⚠️ 〕━━━⬣
┃
┃ ❌ Error al subir
┃ el archivo.
┃
┃ 🔧 Detalles:
┃ ${err.message}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default dixCommand
