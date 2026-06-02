import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const visionAI = {

    name: 'vision',
    alias: ['iaimg', 'imgai', 'visionai', 'ver'],

    run: async (m, { conn, text }) => {

        try {

            const msg = m.message

            const imageMessage =
                msg?.imageMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

            if (!imageMessage) {
                return m.reply('📸 Envía o responde una imagen con .vision')
            }

            // =========================
            // 🔥 DESCARGA UNIVERSAL FIX
            // =========================

            let buffer

            try {

                // 🧠 CASO 1: wrapper moderno (MEJOR OPCIÓN)
                if (m.download) {
                    buffer = await m.download()
                }

                // 🧠 CASO 2: conn socket directo
                else if (conn?.downloadContentFromMessage) {

                    const stream = await conn.downloadContentFromMessage(
                        imageMessage,
                        'image'
                    )

                    const chunks = []
                    for await (const chunk of stream) chunks.push(chunk)

                    buffer = Buffer.concat(chunks)
                }

                // 🧠 CASO 3: fallback extremo
                else {
                    return m.reply('❌ Este bot no soporta descarga de medios (wrapper incompatible)')
                }

            } catch (e) {
                console.log('[DOWNLOAD FAIL]', e)
                return m.reply('❌ No se pudo descargar la imagen')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida')
            }

            // =========================
            // RESPUESTA SIMPLE (DEBUG)
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ VISION FIX OK\n\n✔ Imagen recibida\n📦 Bytes: ${buffer.length}`
            }, { quoted: m })

        } catch (e) {
            console.log('[VISION ERROR]', e)
            m.reply('❌ Vision AI falló')
        }
    }
}

export default visionAI
