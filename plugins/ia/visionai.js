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
            // 1. DESCARGA (SOLO WRAPPER TUYO)
            // =========================

            let buffer

            try {

                if (typeof m.download === 'function') {
                    buffer = await m.download()
                } else {
                    return m.reply('❌ Este bot no soporta descarga de medios')
                }

            } catch (e) {
                console.log('[DOWNLOAD FAIL]', e)
                return m.reply('❌ No se pudo descargar la imagen')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida o vacía')
            }

            // =========================
            // 2. TEMP FILE
            // =========================

            const file = join(tmpdir(), `vision_${Date.now()}.jpg`)
            fs.writeFileSync(file, buffer)

            // =========================
            // 3. IA HUMANA
            // =========================

            let result = ''

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
                                content: "Eres una IA visión que describe imágenes como humano."
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

                result = "📷 Imagen recibida correctamente (IA no disponible)"
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
            m.reply('❌ Vision falló')
        }
    }
}

export default visionAI
