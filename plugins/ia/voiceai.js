import fetch from 'node-fetch'

const voiceAI = {
    name: 'voiceai',
    alias: ['va', 'vozai', 'ttsai'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            const prompt = text || m.quoted?.text

            if (!prompt) return m.reply('🎙️ Escribe algo')

            // =========================
            // IA SIMPLE (fallback seguro)
            // =========================

            let aiResponse = prompt

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
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 120
                    })
                })

                const json = await res.json()

                aiResponse =
                    json?.choices?.[0]?.message?.content || prompt

            } catch {}

            // =========================
            // LIMPIEZA CRÍTICA
            // =========================

            const clean = aiResponse
                .replace(/[*_`~]/g, '')
                .replace(/[^\w\sáéíóúñ¿?¡!,.-]/gi, '')
                .slice(0, 180)

            // =========================
            // TTS (GOOGLE - ESTABLE)
            // =========================

            const url =
                `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(clean)}`

            const resAudio = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://translate.google.com/"
                }
            })

            if (!resAudio.ok) throw new Error('TTS fail')

            const arrayBuffer = await resAudio.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // =========================
            // ENVÍO WHATSAPP (IMPORTANTE)
            // =========================

            await conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })

        } catch (e) {
            console.log('[VOICEAI ERROR]', e)
            m.reply('❌ Error generando voz.')
        }
    }
}

export default voiceAI
