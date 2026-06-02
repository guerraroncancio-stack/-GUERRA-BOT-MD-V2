import fetch from 'node-fetch'

const visionAI = {
    name: 'vision',
    alias: ['iaimg', 'imgai', 'visionai', 'ver'],
    category: 'ai',

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. OBTENER IMAGEN
            // =========================

            const quoted = m.quoted?.message?.imageMessage
            const image = m.message?.imageMessage || quoted

            if (!image) {
                return m.reply('📸 Envía o responde una imagen con .vision')
            }

            const buffer = await conn.downloadMediaMessage(m)

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ No se pudo leer la imagen')
            }

            const base64 = buffer.toString('base64')

            // =========================
            // 2. IA VISION (OPENAI SI EXISTE)
            // =========================

            let result

            try {

                if (!global.openai_key) throw new Error('no key')

                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${global.openai_key}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: "Eres una IA de visión. Describe imágenes de forma clara, corta y precisa."
                            },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: text || "Describe esta imagen" },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:image/jpeg;base64,${base64}`
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 300
                    })
                })

                const json = await res.json()
                result = json?.choices?.[0]?.message?.content

                if (!result) throw new Error('no response')

            } catch (e) {

                // =========================
                // FALLBACK SIMPLE
                // =========================

                result = `No tengo IA avanzada activa, pero la imagen fue recibida correctamente.`
            }

            // =========================
            // 3. RESPUESTA FINAL
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ *IA VISION RESULT*\n\n${result}`
            }, { quoted: m })

        } catch (e) {
            console.log('[VISION ERROR]', e)
            m.reply('❌ Vision AI falló')
        }
    }
}

export default visionAI
