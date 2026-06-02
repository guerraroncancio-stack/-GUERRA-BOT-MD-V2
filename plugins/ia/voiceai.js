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

        try {

            const clean = input.slice(0, 200)

            // =========================
            // 1. ELEVENLABS TTS
            // =========================

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

            if (!res.ok) throw new Error("ElevenLabs fail")

            const buffer = Buffer.from(await res.arrayBuffer())

            // =========================
            // 2. ARCHIVO TEMPORAL MP3
            // =========================

            const mp3Path = join(tmpdir(), `voice_${Date.now()}.mp3`)
            const oggPath = join(tmpdir(), `voice_${Date.now()}.ogg`)

            fs.writeFileSync(mp3Path, buffer)

            // =========================
            // 3. FFmpeg CONVERSIÓN OGG OPUS
            // =========================

            await new Promise((resolve, reject) => {

                exec(
                    `ffmpeg -y -i ${mp3Path} -c:a libopus -b:a 64k ${oggPath}`,
                    (err) => {
                        if (err) reject(err)
                        else resolve()
                    }
                )

            })

            // =========================
            // 4. LECTURA FINAL
            // =========================

            const audio = fs.readFileSync(oggPath)

            // cleanup
            fs.unlinkSync(mp3Path)
            fs.unlinkSync(oggPath)

            // =========================
            // 5. ENVÍO WHATSAPP (100% COMPATIBLE)
            // =========================

            await conn.sendMessage(m.chat, {
                audio,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: m })

        } catch (e) {

            console.log('[VOICEAI FFmpeg ERROR]', e)
            m.reply('❌ VoiceAI FFmpeg falló')
        }
    }
}

export default voiceAI
