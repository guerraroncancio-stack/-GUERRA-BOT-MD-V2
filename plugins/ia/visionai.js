import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const visionAI = {
    name: 'vision',
    alias: ['vision', 'iaimg', 'imgai', 'ver'],

    run: async (m, { conn, text }) => {

        try {

            // =========================
            // 1. DESCARGA ÚNICA COMPATIBLE CON TU BOT
            // =========================

            let buffer

            try {

                // 🔥 SOLO ESTO FUNCIONA EN TU WRAPPER
                buffer = await m.download?.()

            } catch (e) {
                console.log('[DOWNLOAD FAIL]', e)
                return m.reply('❌ No se pudo descargar la imagen (m.download falló)')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida o no detectada')
            }

            // =========================
            // 2. TEMP FILE
            // =========================

            const file = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(file, buffer)

            // =========================
            // 3. IA HUMANA (SAFE)
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
                                content: "Eres una IA visión estilo humano. Describe imágenes naturalmente."
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

                result = "📷 Imagen recibida correctamente, IA no disponible."
            }

            // =========================
            // 4. RESPUESTA FINAL
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ *VISION AI PRO FIX*\n\n🧠 ${result}`
            }, { quoted: m })

            fs.unlinkSync(file)

        } catch (e) {
            console.log('[VISION ERROR]', e)
            m.reply('❌ Vision falló completamente')
        }
    }
}

export default visionAI
