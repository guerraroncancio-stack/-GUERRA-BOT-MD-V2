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

            const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(contenido)}`

            await conn.sendMessage(
                m.chat,
                {
                    audio: { url },
                    mimetype: 'audio/mp4',
                    ptt: true
                },
                { quoted: m }
            )

            await m.react('✅')

        } catch (e) {
            console.error(e)
            await m.react('❌')
            m.reply('❌ Error al generar la voz.')
        }
    }
}

export default leer
