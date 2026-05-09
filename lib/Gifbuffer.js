/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
┃ 👑 GUERRA BOT - FFMPEG ENGINE v3.0.0 ┃
┃ ⚡ Sistema Multimedia Optimizado      ┃
*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

import { promises as fs } from 'fs'
import path, { join } from 'path'
import { spawn } from 'child_process'
import crypto from 'crypto'

const TMP_DIR = join(global.__dirname(import.meta.url), '../tmp')

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📁 CREAR ARCHIVO TEMPORAL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function createTempFile(ext = '') {
  const id = crypto.randomBytes(6).toString('hex')
  return join(TMP_DIR, `${Date.now()}_${id}.${ext}`)
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// ⚡ MOTOR PRINCIPAL FFMPEG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    let inputPath = ''
    let outputPath = ''

    try {
      if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('El buffer proporcionado no es válido')
      }

      inputPath = await createTempFile(ext)
      outputPath = `${inputPath}.${ext2}`

      await fs.writeFile(inputPath, buffer)

      const ff = spawn('ffmpeg', [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-i', inputPath,
        ...args,
        outputPath
      ])

      ff.on('error', async (err) => {
        await safeDelete(inputPath)
        await safeDelete(outputPath)
        reject(err)
      })

      ff.on('close', async (code) => {
        try {
          await safeDelete(inputPath)

          if (code !== 0) {
            await safeDelete(outputPath)
            return reject(
              new Error(`FFmpeg finalizó con código: ${code}`)
            )
          }

          const data = await fs.readFile(outputPath)

          resolve({
            data,
            filename: outputPath,

            async delete() {
              return await safeDelete(outputPath)
            }
          })

        } catch (err) {
          reject(err)
        }
      })

    } catch (err) {
      await safeDelete(inputPath)
      await safeDelete(outputPath)
      reject(err)
    }
  })
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎤 CONVERTIR A PTT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'ogg')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🔊 CONVERTIR A AUDIO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎥 CONVERTIR A VIDEO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '30',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-movflags', '+faststart'
  ], ext, 'mp4')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🖼️ CONVERTIR A WEBP
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function toWebp(buffer, ext) {
  return ffmpeg(buffer, [
    '-vf',
    'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0',
    '-vcodec',
    'libwebp',
    '-lossless',
    '1',
    '-compression_level',
    '6',
    '-qscale',
    '50',
    '-preset',
    'default'
  ], ext, 'webp')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🧹 ELIMINAR ARCHIVOS SEGURO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function safeDelete(filePath = '') {
  try {
    if (filePath) {
      await fs.unlink(filePath)
    }
  } catch { }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📦 EXPORTS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export {
  ffmpeg,
  toPTT,
  toAudio,
  toVideo,
  toWebp
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
┃ 👑 Powered By GUERRA BOT             ┃
*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
