import fetch from 'node-fetch'
import { writeFileSync } from 'fs'

const visionAI = {
    name: 'vision',

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. DETECTAR IMAGEN (BAILEYS V7 SAFE)
            // =========================

            const msg = m.message

            const imageMessage =
                msg?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

            if (!imageMessage) {
                return m.reply('📸 Envía o responde una imagen con .vision')
            }

            // =========================
            // 2. DESCARGA UNIVERSAL (FIX REAL)
            // =========================

            let buffer

            try {

                if (conn.downloadContentFromMessage) {

                    const stream = await conn.downloadContentFromMessage(
                        imageMessage,
                        'image'
                    )

                    let chunks = []

                    for await (const chunk of stream) {
                        chunks.push(chunk)
                    }

                    buffer = Buffer.concat(chunks)

                } else if (conn.downloadMediaMessage) {

                    buffer = await conn.downloadMediaMessage(msg)

                } else {

                    throw new Error("No download method found")
                }

            } catch (e) {
                return m.reply('❌ No se pudo descargar la imagen')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida')
            }

            // =========================
            // 3. BASE64
            // =========================

            const base64 = buffer.toString('base64')

            // =========================
            // 4. IA (OPENAI OPTIONAL)
            // =========================

            let result = ''

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
                                content: "Eres una IA de visión. Describe imágenes claramente."
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

                if (!result) throw new Error()

            } catch (e) {

                result = "📷 Imagen recibida correctamente, pero IA no disponible."
            }

            // =========================
            // 5. RESPUESTA
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ *VISION AI*\n\n${result}`
            }, { quoted: m })

        } catch (e) {
            console.log('[VISION ERROR]', e)
            m.reply('❌ Vision AI falló')
        }
    }
}

export default visionAI
