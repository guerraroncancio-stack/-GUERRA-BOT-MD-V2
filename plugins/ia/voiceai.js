import fetch from 'node-fetch'

global.voiceMemory = global.voiceMemory || {}

const voices = {
    siri: "EXAVITQu4vr4xnSDxMaL",
    male: "ErXwobaYiN019PkySvjV"
}

const voiceAI = {
    name: 'voiceai',
    alias: ['siri', 'va', 'vozai', 'ttsai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            const user = m.sender

            if (!text && !m.quoted?.text) {
                return m.reply('🎙️ Usa: .voiceai siri hola')
            }

            // =========================
            // INPUT + VOICE SELECTOR
            // =========================

            let input = text || m.quoted.text
            let voice = 'siri'

            const parts = input.trim().split(' ')

            if (voices[parts[0]?.toLowerCase()]) {
                voice = parts[0].toLowerCase()
                input = parts.slice(1).join(' ')
            }

            if (!input) return m.reply('❌ Escribe algo.')

            // =========================
            // MEMORIA (CHAT CONTINUO)
            // =========================

            if (!global.voiceMemory[user]) {
                global.voiceMemory[user] = []
            }

            global.voiceMemory[user].push(input)

            if (global.voiceMemory[user].length > 6) {
                global.voiceMemory[user].shift()
            }

            const context = global.voiceMemory[user].join('. ')

            // =========================
            // IA (SIMPLIFICADA ROBUSTA)
            // =========================

            let aiResponse = ''

            try {

                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${global.openai_key || ""}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: "Eres una IA tipo Siri. Respondes corto, natural y conversacional."
                            },
                            {
                                role: "user",
                                content: context
                            }
                        ],
                        max_tokens: 120
                    })
                })

                const json = await res.json()
                aiResponse = json?.choices?.[0]?.message?.content?.trim()

                if (!aiResponse) throw new Error("No AI")

            } catch {

                aiResponse = `Entendido: ${input}`
            }

            // =========================
            // LIMPIEZA
            // =========================

            const clean = aiResponse
                .replace(/[*_`~]/g, '')
                .replace(/[^\w\sáéíóúñ¿?¡!.,-]/gi, '')
                .slice(0, 220)

            // =========================
            // ELEVENLABS (CON FIX KEY ERROR)
            // =========================

            let audioBuffer

            try {

                if (!global.eleven_key || global.eleven_key.length < 10) {
                    throw new Error("NO KEY")
                }

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
                                stability: 0.5,
                                similarity_boost: 0.75
                            }
                        })
                    }
                )

                if (!res.ok) throw new Error("ELEVEN FAIL")

                audioBuffer = Buffer.from(await res.arrayBuffer())

            } catch (e) {

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
            // VALIDACIÓN FINAL
            // =========================

            if (!audioBuffer || audioBuffer.length < 1500) {
                return m.reply('❌ Audio inválido.')
            }

            // =========================
            // SEND
            // =========================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI ULTRA ERROR]', e)
            m.reply('❌ VoiceAI Siri Ultra falló.')
        }
    }
}

export default voiceAI
