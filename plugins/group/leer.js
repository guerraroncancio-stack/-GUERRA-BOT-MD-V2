import edgeTTS from 'edge-tts'
import fs from 'fs'
import os from 'os'
import path from 'path'

const leer = {
    name: 'leer',
    alias: ['tts', 'voz', 'decir', 'speak'],
    category: 'tools',

    async run(m, { conn, text }) {

        const contenido = text || m.quoted?.text

        if (!contenido) {
            return m.reply('🎙️ Ejemplo:\n.leer Hola mundo')
        }

        try {

            await m.react('🎙️')

            const file = path.join(
                os.tmpdir(),
                `tts_${Date.now()}.mp3`
            )

            await edgeTTS.save({
                text: contenido,
                voice: 'es-ES-AlvaroNeural',
                file
            })

            const audio = fs.readFileSync(file)

            await conn.sendMessage(
                m.chat,
                {
                    audio,
                    mimetype: 'audio/mpeg',
                    ptt: true
                },
                { quoted: m }
            )

            fs.unlinkSync(file)

            await m.react('✅')

        } catch (e) {

            console.error(e)
            await m.react('❌')
            m.reply(`❌ Error:\n${e.message}`)
        }
    }
}

export default leer
