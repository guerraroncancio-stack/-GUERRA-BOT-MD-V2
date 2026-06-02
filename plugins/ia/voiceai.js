import fetch from 'node-fetch'

const voiceAI = {
    name: 'voiceai',
    alias: ['va', 'vozai', 'ttsai', 'speakai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            const prompt = text || m.quoted?.text

            if (!prompt) {
                return m.reply('🎙️ Uso: .voiceai ¿qué es la IA?')
            }

            // =========================
            // 1. IA RESPONSE (OPENAI SAFE)
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
                                content: "Responde corto, claro y natural para convertir a voz."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 120
                    })
                })

                const json = await res.json()

                aiResponse =
                    json?.choices?.[0]?.message?.content?.trim()

                if (!aiResponse) throw new Error('Empty AI response')

            } catch (e) {
                aiResponse = `Según tu pregunta: ${prompt}. No pude conectar a IA avanzada.`
            }

            // =========================
            // 2. LIMPIEZA DE TEXTO (CLAVE)
            // =========================

            const cleanText = aiResponse
                .replace(/[^a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ¿?¡!.,\s]/g, '')
                .slice(0, 200)

            // =========================
            // 3. TTS (STABLE FALLBACK)
            // =========================

            let audioBuffer

            try {
                const ttsURL =
                    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(cleanText)}`

                const audioRes = await fetch(ttsURL)

                if (!audioRes.ok) throw new Error('TTS failed')

                audioBuffer = Buffer.from(await audioRes.arrayBuffer())

            } catch (e) {

                // FALLBACK EXTRA (si Google falla)
                const fallbackURL =
                    `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(cleanText.slice(0, 150))}`

                const audioRes = await fetch(fallbackURL)

                if (!audioRes.ok) throw new Error('All TTS failed')

                audioBuffer = Buffer.from(await audioRes.arrayBuffer())
            }

            // =========================
            // 4. SEND AUDIO
            // =========================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI ERROR]', e)
            m.reply('❌ VoiceAI falló completamente.')
        }
    }
}

export default voiceAI
