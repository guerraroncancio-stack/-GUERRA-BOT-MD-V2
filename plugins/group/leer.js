import fetch from 'node-fetch'

const leer = {
    name: 'leer',
    alias: ['tts', 'voz', 'decir', 'speak'],
    category: 'tools',
    cooldown: 3,

    async run(m, { conn, text }) {

        let contenido = text

        if (!contenido && m.quoted?.text) {
            contenido = m.quoted.text
        }

        if (!contenido) {
            return m.reply(`🎙️ Uso:

.leer Hola mundo

O responde a un mensaje con:

.leer`)
        }

        try {

            await m.react('🎙️')

            contenido = contenido
                .trim()
                .slice(0, 3000)

            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(contenido)}&tl=es&client=tw-ob`

            const res = await fetch(url)

            if (!res.ok) {
                throw new Error('Error TTS')
            }

            const buffer = Buffer.from(await res.arrayBuffer())

            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    ptt: true
                },
                {
                    quoted: m
                }
            )

            await m.react('✅')

        } catch (e) {

            console.error(e)

            await m.react('❌')

            m.reply('❌ No pude generar la voz.')
        }
    }
}

export default leer
