import fetch from 'node-fetch'

const voices = {
    brian: "pNInz6obpgDQGcFmaJgB",
    adam: "ErXwobaYiN019PkySvjV",
    bella: "EXAVITQu4vr4xnSDxMaL"
}

const voiceAI = {
    name: 'voiceai',
    alias: ['va', 'vozai', 'ttsai', 'godvoice'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            let input = text || m.quoted?.text

            if (!input) {
                return m.reply('🎙️ Uso: .voiceai [voz] texto\nEj: .voiceai brian hola mundo')
            }

            // =========================
            // VOZ SELECCIÓN
            // =========================

            let voice = "brian"
            let cleanText = input

            const parts = input.split(' ')
            if (voices[parts[0]?.toLowerCase()]) {
                voice = parts[0].toLowerCase()
                cleanText = parts.slice(1).join(' ')
            }

            if (!cleanText) {
                return m.reply('❌ Escribe texto para hablar.')
            }

            // =========================
            // LIMPIEZA
            // =========================

            cleanText = cleanText
                .replace(/[*_`~]/g, '')
                .replace(/[^\w\sáéíóúñ¿?¡!.,-]/gi, '')
                .slice(0, 250)

            // =========================
            // ELEVENLABS TTS
            // =========================

            let audioBuffer

            try {

                const res = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${voices[voice]}`,
                    {
                        method: "POST",
                        headers: {
                            "xi-api-key": global.eleven_key,
                            "Content-Type": "application/json",
                            "accept": "audio/mpeg"
                        },
                        body: JSON.stringify({
                            text: cleanText,
                            model_id: "eleven_multilingual_v2",
                            voice_settings: {
                                stability: 0.5,
                                similarity_boost: 0.7
                            }
                        })
                    }
                )

                if (!res.ok) throw new Error("ElevenLabs fail")

                const arrayBuffer = await res.arrayBuffer()
                audioBuffer = Buffer.from(arrayBuffer)

            } catch (e) {

                // =========================
                // FALLBACK GOOGLE TTS
                // =========================

                const fallbackURL =
                    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(cleanText)}`

                const fb = await fetch(fallbackURL, {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://translate.google.com/"
                    }
                })

                const fbBuffer = Buffer.from(await fb.arrayBuffer())

                audioBuffer = fbBuffer
            }

            // =========================
            // VALIDACIÓN AUDIO
            // =========================

            if (!audioBuffer || audioBuffer.length < 1000) {
                throw new Error("Audio inválido")
            }

            // =========================
            // SEND WHATSAPP
            // =========================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI GOD ERROR]', e)
            m.reply('❌ VoiceAI GOD falló generando voz.')
        }
    }
}

export default voiceAI
