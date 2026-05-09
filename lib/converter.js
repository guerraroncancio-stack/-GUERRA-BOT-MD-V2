/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
┃ 👑 GUERRA BOT - CONVERTER ENGINE     ┃
┃ ⚡ Sistema Multimedia Profesional     ┃
*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

import { promises as fs } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import crypto from 'crypto'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📂 DIRECTORIO TEMPORAL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

const TMP_DIR = join(
  global.__dirname(import.meta.url),
  '../tmp'
)

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🧠 GENERADOR DE NOMBRES TEMPORALES
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function temp(ext = '') {
  const id = crypto.randomBytes(5).toString('hex')
  return join(TMP_DIR, `${Date.now()}_${id}.${ext}`)
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🧹 ELIMINACIÓN SEGURA
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function remove(file = '') {
  try {
    if (file) await fs.unlink(file)
  } catch { }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// ⚡ MOTOR PRINCIPAL FFMPEG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function ffmpeg(
  buffer,
  args = [],
  ext = '',
  ext2 = ''
) {
  return new Promise(async (resolve, reject) => {
    let input = ''
    let output = ''

    try {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error('El archivo enviado no es válido')
      }

      input = await temp(ext)
      output = `${input}.${ext2}`

      await fs.writeFile(input, buffer)

      const ff = spawn('ffmpeg', [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-i', input,
        ...args,
        output
      ])

      ff.on('error', async (err) => {
        await remove(input)
        await remove(output)
        reject(err)
      })

      ff.on('close', async (code) => {
        try {
          await remove(input)

          if (code !== 0) {
            await remove(output)

            return reject(
              new Error(
                `FFmpeg terminó con código ${code}`
              )
            )
          }

          const data = await fs.readFile(output)

          resolve({
            data,
            filename: output,

            async delete() {
              return await remove(output)
            }
          })

        } catch (err) {
          reject(err)
        }
      })

    } catch (err) {
      await remove(input)
      await remove(output)
      reject(err)
    }
  })
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎤 AUDIO A PTT
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
// 🔊 AUDIO NORMAL
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
// 🎥 VIDEO MP4
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
// 🖼️ STICKER WEBP
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function toWebp(buffer, ext) {
  return ffmpeg(buffer, [
    '-vcodec', 'libwebp',

    '-vf',
    "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",

    '-lossless', '1',
    '-compression_level', '6',
    '-qscale', '50',
    '-preset', 'picture'
  ], ext, 'webp')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎬 GIF → MP4
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function gifToMp4(buffer, ext) {
  return ffmpeg(buffer, [
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
  ], ext, 'mp4')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎵 EXTRAER AUDIO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

async function extractAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '192k'
  ], ext, 'mp3')
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📦 EXPORTACIONES
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

export {
  ffmpeg,
  toPTT,
  toAudio,
  toVideo,
  toWebp,
  gifToMp4,
  extractAudio
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*
┃ 👑 Powered By GUERRA BOT             ┃
*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/
