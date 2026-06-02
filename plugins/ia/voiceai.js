import fetch from 'node-fetch'

const voices = {
    siri: "EXAVITQu4vr4xnSDxMaL",   // Bella (tipo Siri femenina)
    male: "ErXwobaYiN019PkySvjV"    // Adam (masculina)
}

const voiceAI = {
    name: 'voiceai',
    alias: ['siri', 'vozai', 'va', 'ttsai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            let input = text || m.quoted?.text

            if (!input) {
                return m.reply('🎙️ Uso: .voiceai siri hola mundo')
            }

            // =========================
            // VOZ SELECTOR
            // =========================

            let voice = 'siri'
            let prompt = input

            const parts = input.trim().split(' ')
            if (voices[parts[0]?.toLowerCase()]) {
                voice = parts[0].toLowerCase()
                prompt = parts.slice(1).join(' ')
            }

            if (!prompt) return m.reply('❌ Escribe el texto.')

            // =========================
            // LIMPIEZA CRÍTICA
            // =========================

            const clean = prompt
                .replace(/[*_`~]/g, '')
                .replace(/[^\w\sáéíóúñ¿?¡!.,-]/gi, '')
                .slice(0, 250)

            // =========================
            // ELEVENLABS TTS
            // =========================

            let audioBuffer

            try {

                const res = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${voices[voice]}/stream`,
                    {
                        method: "POST",
                        headers: {
                            "xi-api-key": global.eleven_key,
                            "Content-Type": "application/json",
                            "Accept": "audio/mpeg"
                        },
                        body: JSON.stringify({
                            text: clean,
                            model_id: "eleven_multilingual_v2",
                            voice_settings: {
                                stability: 0.4,
                                similarity_boost: 0.8
                            }
                        })
                    }
                )

                if (!res.ok) {
                    const err = await res.text()
                    throw new Error("ElevenLabs error: " + err)
                }

                const arrayBuffer = await res.arrayBuffer()
                audioBuffer = Buffer.from(arrayBuffer)

            } catch (e) {

                console.log('[ELEVEN FALLBACK]', e.message)

                // =========================
                // FALLBACK GOOGLE TTS
                // =========================

                const url =
                    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(clean)}`

                const fb = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://translate.google.com/"
                    }
                })

                audioBuffer = Buffer.from(await fb.arrayBuffer())
            }

            // =========================
            // VALIDACIÓN FINAL (CLAVE)
            // =========================

            if (!audioBuffer || audioBuffer.length < 2000) {
                throw new Error("Audio corrupto o vacío")
            }

            // =========================
            // ENVÍO WHATSAPP (FIX REAL)
            // =========================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI SIRI ERROR]', e)
            m.reply('❌ VoiceAI no pudo generar audio estable.')
        }
    }
}

export default voiceAI
