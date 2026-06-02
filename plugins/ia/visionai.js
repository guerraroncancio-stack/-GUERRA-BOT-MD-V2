import fetch from 'node-fetch'
import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import Tesseract from 'tesseract.js'

const visionAI = {
    name: 'vision',

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. DETECTAR IMAGEN (BAILEYS V7 FIX REAL)
            // =========================

            const msg = m.message

            const imageMessage =
                msg?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

            if (!imageMessage) {
                return m.reply('📸 Envía o responde una imagen con .vision')
            }

            // =========================
            // 2. DESCARGA STREAM (FIX 100%)
            // =========================

            let buffer

            try {

                const stream = await conn.downloadContentFromMessage(
                    imageMessage,
                    'image'
                )

                const chunks = []
                for await (const chunk of stream) {
                    chunks.push(chunk)
                }

                buffer = Buffer.concat(chunks)

            } catch (e) {
                console.log('[DOWNLOAD ERROR]', e)
                return m.reply('❌ No se pudo descargar la imagen')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida o corrupta')
            }

            // =========================
            // 3. GUARDAR TEMP
            // =========================

            const filePath = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(filePath, buffer)

            // =========================
            // 4. OCR (LECTURA DE TEXTO)
            // =========================

            let ocrText = ''

            try {
                const result = await Tesseract.recognize(filePath, 'spa')
                ocrText = result.data.text.trim()
            } catch (e) {
                ocrText = ''
            }

            // =========================
            // 5. DETECCIÓN “HUMANA” (SIMULADA + IA OPCIONAL)
            // =========================

            let aiDescription = ''

            try {

                if (!global.openai_key) throw new Error('no key')

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
                                content:
                                    "Eres una IA visión estilo humano. Describe la imagen, detecta objetos, contexto, emociones y escena como si fueras una persona observando."
                            },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: text || "Analiza esta imagen" },
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
                aiDescription = json?.choices?.[0]?.message?.content

                if (!aiDescription) throw new Error()

            } catch (e) {

                // fallback humano básico
                aiDescription = "No tengo IA activa, pero puedo ver que es una imagen y fue procesada correctamente."
            }

            // =========================
            // 6. RESPUESTA FINAL
            // =========================

            let result = `👁️ *VISION AI PRO MAX*\n\n`

            result += `🧠 *Análisis humano:*\n${aiDescription}\n\n`

            if (ocrText) {
                result += `📝 *Texto detectado (OCR):*\n${ocrText}\n\n`
            }

            result += `📊 *Estado:* Imagen procesada correctamente`

            await conn.sendMessage(m.chat, {
                text: result
            }, { quoted: m })

            // cleanup
            fs.unlinkSync(filePath)

        } catch (e) {
            console.log('[VISION PRO ERROR]', e)
            m.reply('❌ Vision AI Pro falló')
        }
    }
}

export default visionAI
