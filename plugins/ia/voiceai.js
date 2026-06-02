import fetch from 'node-fetch'

global.voiceMemory = global.voiceMemory || {}

const voices = {
    siri: "EXAVITQu4vr4xnSDxMaL"
}

const voiceAI = {
    name: 'voiceai',

    run: async (m, { conn, text }) => {

        try {

            let input = text || m.quoted?.text
            if (!input) return m.reply('🎙️ Usa: .voiceai texto')

            // =====================
            // IA SIMPLE (fallback seguro)
            // =====================
            let response = input.slice(0, 200)

            // =====================
            // ELEVENLABS
            // =====================
            let audioBuffer

            try {

                const res = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${voices.siri}/stream`,
                    {
                        method: "POST",
                        headers: {
                            "xi-api-key": global.eleven_key,
                            "Content-Type": "application/json",
                            "Accept": "audio/mpeg"
                        },
                        body: JSON.stringify({
                            text: response,
                            model_id: "eleven_multilingual_v2",
                            voice_settings: {
                                stability: 0.4,
                                similarity_boost: 0.8
                            }
                        })
                    }
                )

                if (!res.ok) throw new Error("Eleven fail")

                const arrayBuffer = await res.arrayBuffer()
                audioBuffer = Buffer.from(arrayBuffer)

            } catch (e) {

                console.log('[FALLBACK TTS]')

                const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(response)}`

                const fb = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://translate.google.com/"
                    }
                })

                audioBuffer = Buffer.from(await fb.arrayBuffer())
            }

            // =====================
            // 🔥 FIX CLAVE (NO CORRUPCIÓN)
            // =====================

            if (!audioBuffer || audioBuffer.length < 2000) {
                return m.reply('❌ Audio inválido generado')
            }

            // =====================
            // ENVIAR COMO PTM REAL (FIX WHATSAPP)
            // =====================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI ERROR]', e)
            m.reply('❌ Error generando voz')
        }
    }
}

export default voiceAI
