import fetch from 'node-fetch'
import { exec } from 'child_process'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

global.voiceMemory = global.voiceMemory || {}

const voices = {
    siri: "EXAVITQu4vr4xnSDxMaL"
}

const voiceAI = {
    name: 'voiceai',

    run: async (m, { conn, text }) => {

        const input = text || m.quoted?.text
        if (!input) return m.reply('🎙️ Uso: .voiceai texto')

        const clean = input.slice(0, 200)

        let buffer

        // =========================
        // 1. ELEVENLABS (SAFE TRY)
        // =========================

        try {

            if (!global.eleven_key || global.eleven_key.length < 10) {
                throw new Error("NO KEY")
            }

            const res = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voices.siri}/stream`,
                {
                    method: "POST",
                    headers: {
                        "xi-api-key": global.eleven_key,
                        "Content-Type": "application/json",
                        "Accept": "audio/mpeg"
                    },
                    body: JSON.stringify({
                        text: clean,
                        model_id: "eleven_multilingual_v2",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.8
                        }
                    })
                }
            )

            if (!res.ok) {
                const err = await res.text()
                throw new Error("ELEVEN ERROR: " + err)
            }

            buffer = Buffer.from(await res.arrayBuffer())

        } catch (e) {

            console.log('[VOICEAI] Eleven fallback activated:', e.message)

            // =========================
            // 2. FALLBACK GOOGLE TTS (SEGURO)
            // =========================

            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(clean)}`

            const fb = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://translate.google.com/"
                }
            })

            buffer = Buffer.from(await fb.arrayBuffer())
        }

        // =========================
        // 3. VALIDACIÓN
        // =========================

        if (!buffer || buffer.length < 1500) {
            return m.reply('❌ No se pudo generar audio')
        }

        // =========================
        // 4. FFmpeg SOLO SI HAY NECESIDAD
        // =========================

        const mp3Path = join(tmpdir(), `v_${Date.now()}.mp3`)
        const oggPath = join(tmpdir(), `v_${Date.now()}.ogg`)

        fs.writeFileSync(mp3Path, buffer)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -y -i ${mp3Path} -c:a libopus -b:a 64k ${oggPath}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        const audio = fs.readFileSync(oggPath)

        fs.unlinkSync(mp3Path)
        fs.unlinkSync(oggPath)

        // =========================
        // 5. ENVÍO FINAL
        // =========================

        await conn.sendMessage(m.chat, {
            audio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m })
    }
}

export default voiceAI
