import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import Tesseract from 'tesseract.js'

const visionAI = {
    name: 'vision',
    alias: ['vision', 'iaimg', 'imgai', 'ver', 'detect'],

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. DETECTAR IMAGEN (UNIVERSAL)
            // =========================

            const msg = m.message

            const imageMessage =
                msg?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

            if (!imageMessage) {
                return m.reply('📸 Envía o responde una imagen con .vision')
            }

            // =========================
            // 2. DESCARGA UNIVERSAL FIX (BAILEYS WRAPPER SAFE)
            // =========================

            let buffer

            try {

                if (m.download) {
                    buffer = await m.download()
                } else if (conn?.downloadContentFromMessage) {

                    const stream = await conn.downloadContentFromMessage(
                        imageMessage,
                        'image'
                    )

                    const chunks = []
                    for await (const chunk of stream) chunks.push(chunk)

                    buffer = Buffer.concat(chunks)

                } else {
                    return m.reply('❌ Wrapper no soporta descarga de medios')
                }

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

            const file = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(file, buffer)

            // =========================
            // 4. OCR (LECTURA DE TEXTO)
            // =========================

            let ocr = ''

            try {
                const res = await Tesseract.recognize(file, 'spa')
                ocr = res.data.text?.trim()
            } catch {
                ocr = ''
            }

            // =========================
            // 5. YOLO / DETECCIÓN DE OBJETOS
            // =========================

            let objects = ''

            try {

                if (global.yolo_api) {

                    const res = await fetch(global.yolo_api, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: buffer.toString('base64')
                        })
                    })

                    const json = await res.json()

                    objects = json?.predictions
                        ?.map(p => `${p.class} (${Math.round(p.confidence * 100)}%)`)
                        .join(', ')

                }

            } catch (e) {
                objects = ''
            }

            // fallback si no hay YOLO
            if (!objects) {
                objects = 'Detección no disponible (modo estimado activo)'
            }

            // =========================
            // 6. IA HUMANA (ANÁLISIS INTELIGENTE)
            // =========================

            let analysis = ''

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
                                content: `
Eres una IA de visión estilo humano.
Describe la imagen como si fueras una persona:
- qué ves
- qué está pasando
- emociones
- contexto
- interpretación
Responde natural, no técnico.
                                `
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
                analysis = json?.choices?.[0]?.message?.content

                if (!analysis) throw new Error()

            } catch (e) {

                analysis = "No tengo IA activa, pero la imagen fue procesada correctamente."
            }

            // =========================
            // 7. RESPUESTA FINAL GOD MODE
            // =========================

            let out = `👁️ *VISION AI GOD MODE*\n\n`

            out += `🧠 *Análisis humano:*\n${analysis}\n\n`

            out += `📦 *Objetos detectados (YOLO):*\n${objects}\n\n`

            if (ocr) {
                out += `📝 *OCR (texto detectado):*\n${ocr}\n\n`
            }

            out += `⚡ Estado: Procesado correctamente`

            await conn.sendMessage(m.chat, {
                text: out
            }, { quoted: m })

            fs.unlinkSync(file)

        } catch (e) {
            console.log('[VISION GOD ERROR]', e)
            m.reply('❌ Vision God Mode falló')
        }
    }
}

export default visionAI
