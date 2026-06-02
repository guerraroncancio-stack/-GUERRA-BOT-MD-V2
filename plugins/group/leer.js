import fetch from 'node-fetch'

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

            const voice = 'Brian' // Cambia aquí la voz

            const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(contenido)}`

            const res = await fetch(url)

            if (!res.ok) {
                const errorText = await res.text()
                console.log('TTS ERROR:', errorText)
                throw new Error(`HTTP ${res.status}`)
            }

            const buffer = Buffer.from(await res.arrayBuffer())

            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: true
                },
                { quoted: m }
            )

            await m.react('✅')

        } catch (e) {

            console.error(e)
            await m.react('❌')
            m.reply(`❌ Error al generar la voz.\n${e.message}`)
        }
    }
}

export default leer
