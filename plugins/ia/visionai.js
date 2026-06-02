import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const visionAI = {
    name: 'vision',
    alias: ['vision', 'imgai', 'iaimg', 'ver'],

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. EXTRAER MENSAJE REAL (FIX BAILEYS ROTO)
            // =========================

            const msg =
                m.message?.imageMessage
                || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
                || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage?.message?.imageMessage

            if (!msg) {
                return m.reply('📸 Envía o responde una imagen correctamente')
            }

            // =========================
            // 2. DESCARGA DIRECTA DESDE SOCKET REAL
            // =========================

            let buffer

            try {

                const stream = await conn.downloadContentFromMessage(msg, 'image')

                const chunks = []
                for await (const chunk of stream) chunks.push(chunk)

                buffer = Buffer.concat(chunks)

            } catch (e) {
                console.log('[VISION DOWNLOAD ERROR]', e)
                return m.reply('❌ No se pudo descargar la imagen (formato inválido o viewOnce roto)')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida o corrupta')
            }

            // =========================
            // 3. TEMP FILE
            // =========================

            const file = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(file, buffer)

            // =========================
            // 4. IA HUMANA (SAFE)
            // =========================

            let result = ''

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
                                content: "Eres una IA que describe imágenes como humano."
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
                result = json?.choices?.[0]?.message?.content

                if (!result) throw new Error()

            } catch (e) {

                result = "📷 Imagen recibida correctamente, pero IA no disponible."
            }

            // =========================
            // 5. RESPUESTA FINAL
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ *VISION AI GOD FIX*\n\n🧠 ${result}`
            }, { quoted: m })

            fs.unlinkSync(file)

        } catch (e) {
            console.log('[VISION GOD ERROR]', e)
            m.reply('❌ Vision falló completamente')
        }
    }
}

export default visionAI
