import fetch from 'node-fetch'

const voiceAI = {
    name: 'voiceai',
    alias: ['va', 'vozai', 'ttsai', 'speakai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            const prompt = text || m.quoted?.text

            if (!prompt) {
                return m.reply('🎙️ Uso: .voiceai ¿qué es la inteligencia artificial?')
            }

            // =========================
            // 1. IA RESPONSE (SIMULADA PRO)
            // =========================

            let aiResponse

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
                                content: "Eres una IA útil, responde corto, claro y natural para voz."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ]
                    })
                })

                const json = await res.json()
                aiResponse = json?.choices?.[0]?.message?.content

                if (!aiResponse) throw new Error("No AI response")

            } catch (e) {
                // FALLBACK SI NO HAY API KEY
                aiResponse = `No tengo conexión a IA avanzada, pero según tu pregunta: ${prompt}`
            }

            // =========================
            // 2. TTS (VOZ)
            // =========================

            const voice = "Brian" // puedes cambiar: Matthew, es-ES, etc.

            const ttsURL =
                `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(aiResponse)}`

            const audioRes = await fetch(ttsURL)

            if (!audioRes.ok) {
                throw new Error("TTS failed")
            }

            const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

            // =========================
            // 3. ENVÍO WHATSAPP
            // =========================

            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI ERROR]', e)
            m.reply('❌ VoiceAI falló generando respuesta.')
        }
    }
}

export default voiceAI
