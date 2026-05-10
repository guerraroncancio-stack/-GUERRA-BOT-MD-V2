import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'
import webp from 'node-webpmux'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import { fileTypeFromBuffer } from 'file-type'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmp = path.join(__dirname, '../tmp')

if (!fs.existsSync(tmp)) {
  fs.mkdirSync(tmp, { recursive: true })
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 STICKER SIMPLE FIX
━━━━━━━━━━━━━━━━━━━━━━━
*/

const support = {
  ffmpeg: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false
}

global.support = support

/*
━━━━━━━━━━━━━━━━━━━━━━━
 ADD EXIF
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function addExif(
  webpSticker,
  packname = 'Simple Bot',
  author = 'Kevin',
  categories = ['🤖'],
  extra = {}
) {

  const img = new webp.Image()

  const stickerPackId = crypto
    .randomBytes(32)
    .toString('hex')

  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: categories,
    ...extra
  }

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ])

  const jsonBuffer = Buffer.from(
    JSON.stringify(json),
    'utf8'
  )

  const exif = Buffer.concat([
    exifAttr,
    jsonBuffer
  ])

  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  await img.load(webpSticker)

  img.exif = exif

  return await img.save(null)
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 IMAGE / VIDEO → WEBP
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function sticker(
  img,
  packname = 'Simple Bot',
  author = 'Kevin',
  categories = ['🤖']
) {

  const type = await fileTypeFromBuffer(img)

  if (!type) {
    throw new Error('Archivo inválido')
  }

  const input = path.join(
    tmp,
    `${Date.now()}.${type.ext}`
  )

  const output = path.join(
    tmp,
    `${Date.now()}.webp`
  )

  await fs.promises.writeFile(input, img)

  return new Promise((resolve, reject) => {

    let command = fluent_ffmpeg(input)

    if (/video/i.test(type.mime)) {
      command.inputFormat(type.ext)
    }

    command
      .on('error', async (err) => {

        console.log(err)

        await fs.promises.unlink(input)
          .catch(() => {})

        reject(err)
      })

      .on('end', async () => {

        try {

          const buffer = await fs.promises.readFile(output)

          const stickerBuffer = await addExif(
            buffer,
            packname,
            author,
            categories
          )

          await fs.promises.unlink(input)
            .catch(() => {})

          await fs.promises.unlink(output)
            .catch(() => {})

          resolve(stickerBuffer)

        } catch (e) {
          reject(e)
        }
      })

      .addOutputOptions([
        '-vcodec',
        'libwebp',

        '-vf',
        "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",

        '-lossless',
        '1',

        '-compression_level',
        '6',

        '-q:v',
        '80',

        '-loop',
        '0',

        '-preset',
        'default',

        '-an',

        '-vsync',
        '0'
      ])

      .toFormat('webp')
      .save(output)
  })
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 URL → BUFFER
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function getBuffer(url) {

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(
      `Error descargando archivo: ${res.status}`
    )
  }

  return await res.buffer()
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 EXPORTS
━━━━━━━━━━━━━━━━━━━━━━━
*/

export {
  sticker,
  addExif,
  getBuffer,
  support
}
