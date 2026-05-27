import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => {
    thumb = Buffer.from(buf)
  })
  .catch(() => null)

async function downloadMedia(message, type) {

  const stream =
    await downloadContentFromMessage(
      message,
      type
    )

  let buffer = Buffer.alloc(0)

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  return buffer
}

export default {

  name: 'hidetag',

  alias: ['n', 'tagall'],

  group: true,

  admin: true,

  botAdmin: true,

  async run(m, { conn, text }) {

    try {

      const metadata =
        await conn.groupMetadata(m.chat)

      const users =
        metadata.participants.map(
          p => p.id
        )

      const fkontak = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: 'GUERRA'
        },
        message: {
          locationMessage: {
            name: 'GUERRA BOT 👑',
            jpegThumbnail: thumb
          }
        },
        participant: '0@s.whatsapp.net'
      }

      /* =======================
         IMAGE
      ======================= */

      if (
        m.quoted?.mtype === 'imageMessage'
      ) {

        const media =
          await downloadMedia(
            m.quoted.message.imageMessage,
            'image'
          )

        return await conn.sendMessage(
          m.chat,
          {
            image: media,
            caption: text || '',
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      /* =======================
         VIDEO
      ======================= */

      if (
        m.quoted?.mtype === 'videoMessage'
      ) {

        const media =
          await downloadMedia(
            m.quoted.message.videoMessage,
            'video'
          )

        return await conn.sendMessage(
          m.chat,
          {
            video: media,
            caption: text || '',
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      /* =======================
         AUDIO
      ======================= */

      if (
        m.quoted?.mtype === 'audioMessage'
      ) {

        const media =
          await downloadMedia(
            m.quoted.message.audioMessage,
            'audio'
          )

        return await conn.sendMessage(
          m.chat,
          {
            audio: media,
            mimetype: 'audio/mpeg',
            ptt: false,
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      /* =======================
         STICKER
      ======================= */

      if (
        m.quoted?.mtype === 'stickerMessage'
      ) {

        const media =
          await downloadMedia(
            m.quoted.message.stickerMessage,
            'sticker'
          )

        return await conn.sendMessage(
          m.chat,
          {
            sticker: media,
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      /* =======================
         TEXT
      ======================= */

      return await conn.sendMessage(
        m.chat,
        {
          text: text || '‎',
          mentions: users
        },
        { quoted: fkontak }
      )

    } catch (e) {

      console.log(e)

      return conn.sendMessage(
        m.chat,
        {
          text: '❌ Error en hidetag.'
        },
        { quoted: m }
      )

    }

  }

}
