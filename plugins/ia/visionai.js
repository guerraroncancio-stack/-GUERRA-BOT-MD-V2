import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const visionAI = {

    name: 'vision',
    alias: ['iaimg', 'imgai', 'ver', 'visionai'],

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
            // DESCARGA SEGURA
            // =========================

            let buffer

            try {

                const stream = await conn.downloadContentFromMessage(imageMessage, 'image')

                const chunks = []
                for await (const chunk of stream) chunks.push(chunk)

                buffer = Buffer.concat(chunks)

            } catch (e) {
                console.log('[DOWNLOAD FAIL]', e)
                return m.reply('❌ No se pudo descargar la imagen')
            }

            if (!buffer || buffer.length < 1000) {
                return m.reply('❌ Imagen inválida')
            }

            // =========================
            // RESPUESTA SIMPLE (SIN IA PARA PROBAR)
            // =========================

            await conn.sendMessage(m.chat, {
                text: `👁️ VISION ACTIVO\n\n✔ Imagen recibida correctamente\n📦 Tamaño: ${buffer.length} bytes`
            }, { quoted: m })

        } catch (e) {
            console.log('[VISION BOOT ERROR]', e)
            m.reply('❌ Vision no está cargando')
        }
    }
}

export default visionAI
