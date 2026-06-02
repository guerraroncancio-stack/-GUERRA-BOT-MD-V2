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

            const voice = 'Brian'

            const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(contenido)}`

            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Referer': 'https://streamelements.com/'
                }
            })

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
            m.reply(`❌ Error: ${e.message}`)
        }
    }
}

export default leer
