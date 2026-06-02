import fetch from 'node-fetch'

const voiceAI = {
    name: 'voiceai',
    alias: ['va', 'vozai', 'ttsai', 'speakai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            const prompt = text || m.quoted?.text

            if (!prompt) {
                return m.reply('🎙️ Uso: .voiceai hola mundo')
            }

            // =========================
            // 1. IA (OPENAI)
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
                                content: "Responde claro, corto y natural para voz."
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

                if (!aiResponse) throw new Error("No AI")

            } catch {
                aiResponse = `No pude usar IA avanzada. Respuesta: ${prompt}`
            }

            // =========================
            // 2. LIMPIEZA CRÍTICA
            // =========================

            const clean = aiResponse
                .replace(/[*_`~]/g, '')
                .replace(/[^\w\sáéíóúñ¿?¡!.,-]/gi, '')
                .slice(0, 180)

            // =========================
            // 3. TTS SEGURO (GOOGLE BASE)
            // =========================

            const ttsURL =
                `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(clean)}`

            const audioRes = await fetch(ttsURL, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://translate.google.com/"
                }
            })

            if (!audioRes.ok) throw new Error("TTS FAIL")

            const arrayBuffer = await audioRes.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // =========================
            // 4. VALIDACIÓN ANTI AUDIO ROTO
            // =========================

            if (!buffer || buffer.length < 1000) {
                throw new Error("Audio corrupto")
            }

            // =========================
            // 5. ENVÍO WHATSAPP
            // =========================

            await conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI PRO ERROR]', e)
            m.reply('❌ VoiceAI falló generando audio estable.')
        }
    }
}

export default voiceAI
