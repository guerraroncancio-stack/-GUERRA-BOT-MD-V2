import axios from 'axios'
import FormData from 'form-data'
import { Buffer } from 'node:buffer'

// =========================================
// 👑 GUERRA HD AI
// =========================================

const hdCommand = {

    name: 'hd',

    alias: [
        'remini',
        'upscale',
        'mejorar',
        'enhance',
        'hdr'
    ],

    category: 'tools',

    cooldown: 5,

    async run(m, {
        conn,
        args
    }) {

        try {

            // =========================================
            // 📸 IMAGEN
            // =========================================

            const q =
            m.quoted
            ? m.quoted
            : m

            const mime =
            (q.msg || q).mimetype ||
            q.mediaType ||
            ''

            if (
                !mime ||
                !mime.startsWith('image/')
            ) {

                return conn.reply(

                    m.chat,

`╭━━〔 👑 GUERRA HD AI 👑 〕━━⬣
┃ ❌ Debes responder
┃ a una imagen.
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplo:
┃ ➥ .hd
┃ ➥ .remini
┃ ➥ .upscale high
╰━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

            // =========================================
            // ⚙️ CONFIG
            // =========================================

            const quality =
            (
                args[0] ||
                'high'
            ).toLowerCase()

            const validQuality = [

                'low',
                'medium',
                'high'

            ]

            const finalQuality =
            validQuality.includes(quality)
            ? quality
            : 'high'

            // =========================================
            // ⚡ REACCIÓN
            // =========================================

            await m.react('🪄')

            // =========================================
            // 📥 DESCARGAR
            // =========================================

            const media =
            await q.download()

            if (!media) {

                throw new Error(
                    'No se pudo descargar'
                )

            }

            // =========================================
            // 🚀 MEJORAR
            // =========================================

            const enhanced =
            await enhanceImage(
                media,
                finalQuality
            )

            // =========================================
            // 📤 ENVIAR
            // =========================================

            const caption =

`╭━━〔 👑 GUERRA HD AI 👑 〕━━⬣
┃ ✨ Imagen mejorada
┃ ⚡ Calidad: ${finalQuality}
┃ 🚀 Sistema AI activo
┣━━━━━━━━━━━━━━━━━━⬣
┃ 👑 Powered By:
┃ ➥ Kevin Guerra
╰━━━━━━━━━━━━━━━━━━⬣`

            await conn.sendMessage(

                m.chat,

                {
                    image: enhanced,
                    caption
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

`╭━━〔 ⚠️ GUERRA HD AI ⚠️ 〕━━⬣
┃ ❌ Error al mejorar
┃ la imagen.
┣━━━━━━━━━━━━━━━━━━⬣
┃ 💡 Intenta nuevamente.
╰━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

// =========================================
// 🚀 UPSCALE SYSTEM
// =========================================

async function enhanceImage(
    buffer,
    quality = 'high'
) {

    const form =
    new FormData()

    form.append(
        'method',
        '2'
    )

    form.append(
        'is_pro_version',
        'false'
    )

    form.append(
        'is_enhancing_more',
        'true'
    )

    form.append(
        'max_image_size',
        quality
    )

    form.append(
        'file',
        buffer,
        `guerra_${Date.now()}.jpg`
    )

    const { data } =
    await axios.post(

        'https://ihancer.com/api/enhance',

        form,

        {

            headers: {

                ...form.getHeaders(),

                'accept-encoding':
                'gzip',

                'user-agent':
                'Mozilla/5.0'

            },

            responseType:
            'arraybuffer',

            timeout: 60000

        }

    )

    return Buffer.from(data)

}

export default hdCommand
