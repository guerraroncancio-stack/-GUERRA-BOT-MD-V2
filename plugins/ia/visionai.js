import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const visionAI = {
    name: 'vision',
    alias: ['vision', 'iaimg', 'imgai', 'ver'],

    run: async (m, { conn, text }) => {

        try {

            const msg = m.message

            // =========================
            // 1. EXTRAER IMAGEN (FIX REAL BAILEYS)
            // =========================

            let imageMessage =
                msg?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage?.message?.imageMessage

            if (!imageMessage) {
                return m.reply('📸 Envía o responde una imagen (no texto)')
            }

            // =========================
            // 2. DESCARGA SEGURA (SIN m.download)
            // =========================

            let stream

            try {

                stream = await conn.downloadContentFromMessage(imageMessage, 'image')

            } catch (e) {

                // 🔥 FALLBACK VIEWONCE / STRUCT ROTO
                try {
                    const q = m.quoted?.message
                    const alt = q?.imageMessage || q?.viewOnceMessage?.message?.imageMessage

                    if (!alt) throw new Error('no alt image')

                    stream = await conn.downloadContentFromMessage(alt, 'image')

                } catch (e2) {
                    console.log('[DOWNLOAD FAIL]', e2)
                    return m.reply('❌ No se pudo descargar la imagen (formato no soportado)')
                }
            }

            // =========================
            // 3. STREAM → BUFFER
            // =========================

            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)

            const buffer = Buffer.concat(chunks)

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida o corrupta')
            }

            // =========================
            // 4. TEMP FILE
            // =========================

            const file = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(file, buffer)

            // =========================
            // 5. IA HUMANA (SAFE)
            // =========================

            let analysis = ''

            try {

                if (!global.openai_key) throw new Error()

                const base64 = buffer.toString('base64')

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
                                content: "Eres una IA que describe imágenes como humano, natural y directo."
                            },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: text || "Describe la imagen" },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:image/jpeg;base64,${base64}`
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 400
                    })
                })

                const json = await res.json()
                analysis = json?.choices?.[0]?.message?.content

                if (!analysis) throw new Error()

            } catch (e) {

                analysis = "📷 Imagen recibida correctamente, pero IA no disponible."
            }

            // =========================
            // 6. OUTPUT FINAL
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ *VISION AI PRO FIX*\n\n🧠 ${analysis}`
            }, { quoted: m })

            fs.unlinkSync(file)

        } catch (e) {
            console.log('[VISION FINAL ERROR]', e)
            m.reply('❌ Vision falló completamente')
        }
    }
}

export default visionAI
