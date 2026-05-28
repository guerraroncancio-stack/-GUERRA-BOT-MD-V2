import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const dixCommand = {

    name: 'dix',

    alias: [
        'upload',
        'tourl',
        'imgurl'
    ],

    category: 'tools',

    async run(m, { conn }) {

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

`┏━━━〔 👑 GUERRA API 👑 〕━━━⬣
┃
┃ ❌ Responde a una imagen,
┃ video o audio.
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

            // =========================================
            // 📂 EXTENSIÓN
            // =========================================

            let ext = 'bin'

            if (mime.includes('image'))
            ext = 'jpg'

            else if (mime.includes('video'))
            ext = 'mp4'

            else if (mime.includes('audio'))
            ext = 'mp3'

            // =========================================
            // 🆔 RANDOM NAME
            // =========================================

            const fileName =
            crypto.randomBytes(6)
            .toString('hex') +
            '.' + ext

            // =========================================
            // 📁 SAVE
            // =========================================

            const folder =
            './uploads'

            if (!fs.existsSync(folder)) {

                fs.mkdirSync(folder)

            }

            const filePath =
            path.join(folder, fileName)

            fs.writeFileSync(
                filePath,
                buffer
            )

            // =========================================
            // 🌐 YOUR DOMAIN
            // =========================================

            const url =

`https://guerra-api.com/uploads/${fileName}`

            // =========================================
            // ✅ SEND
            // =========================================

            await m.react('✅')

            return conn.sendMessage(

                m.chat,

                {
                    text:
`┏━━━〔 👑 GUERRA API 👑 〕━━━⬣
┃
┃ ✅ Archivo subido
┃ exitosamente
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 🌐 URL:
┃ ${url}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By
┃ Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`
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

`┏━━━〔 ⚠️ ERROR ⚠️ 〕━━━⬣
┃
┃ No se pudo subir
┃ el archivo.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default dixCommand
