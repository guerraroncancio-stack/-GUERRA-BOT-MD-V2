import {
  generateWAMessageFromContent,
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

function unwrapMessage(m = {}) {

  let n = m

  while (
    n?.viewOnceMessage?.message ||
    n?.viewOnceMessageV2?.message ||
    n?.viewOnceMessageV2Extension?.message ||
    n?.ephemeralMessage?.message
  ) {

    n =
      n.viewOnceMessage?.message ||
      n.viewOnceMessageV2?.message ||
      n.viewOnceMessageV2Extension?.message ||
      n.ephemeralMessage?.message

  }

  return n
}

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

  alias: [
    'n',
    'notify',
    'tagall'
  ],

  group: true,

  admin: true,

  botAdmin: true,

  async run(m, {
    conn,
    text
  }) {

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
          id: 'Guerra'
        },

        message: {

          locationMessage: {

            name:
            'Hola, Soy GUERRA 𝐁𝐎𝐓',

            jpegThumbnail: thumb

          }

        },

        participant:
        '0@s.whatsapp.net'

      }

      const q =
        m.quoted
          ? unwrapMessage(m.quoted)
          : unwrapMessage(m)

      const mtype =
        q.mtype ||
        Object.keys(
          q.message || {}
        )[0] ||
        ''

      const watermark =
        '> GUERRA 𝐁𝐎𝐓 👑'

      const originalCaption =
        (
          q.msg?.caption ||
          q.text ||
          ''
        ).trim()

      const finalCaption =
        text
          ? `${text}\n\n${watermark}`
          : originalCaption
          ? `${originalCaption}\n\n${watermark}`
          : watermark

      /* =======================
         IMAGE
      ======================= */

      if (
        m.quoted?.mtype ===
        'imageMessage'
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
            caption: finalCaption,
            mentions: users
          },
          {
            quoted: fkontak
          }
        )

      }

      /* =======================
         VIDEO
      ======================= */

      if (
        m.quoted?.mtype ===
        'videoMessage'
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
            caption: finalCaption,
            mimetype: 'video/mp4',
            mentions: users
          },
          {
            quoted: fkontak
          }
        )

      }

      /* =======================
         AUDIO
      ======================= */

      if (
        m.quoted?.mtype ===
        'audioMessage'
      ) {

        const media =
          await downloadMedia(
            m.quoted.message.audioMessage,
            'audio'
          )

        await conn.sendMessage(
          m.chat,
          {
            audio: media,
            mimetype: 'audio/mpeg',
            ptt: false,
            mentions: users
          },
          {
            quoted: fkontak
          }
        )

        return await conn.sendMessage(
          m.chat,
          {
            text: finalCaption,
            mentions: users
          },
          {
            quoted: fkontak
          }
        )

      }

      /* =======================
         STICKER
      ======================= */

      if (
        m.quoted?.mtype ===
        'stickerMessage'
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
          {
            quoted: fkontak
          }
        )

      }

     /* =======================
   QUOTED TEXT
======================= */

if (m.quoted) {

  const content =
    q?.message?.[mtype]

  // 🔥 SI NO EXISTE
  if (!content) {

    return await conn.sendMessage(
      m.chat,
      {
        text: finalCaption,
        mentions: users
      },
      {
        quoted: fkontak
      }
    )

  }

  // 🔥 AGREGAR TEXTO Y MENCIONES
  if (
    typeof content === 'object'
  ) {

    content.caption =
      finalCaption

    content.text =
      finalCaption

    content.contextInfo = {
      ...(content.contextInfo || {}),
      mentionedJid: users
    }

  }

  const newMsg =
    generateWAMessageFromContent(
      m.chat,
      {
        [mtype]: content
      },
      {
        quoted: fkontak,
        userJid: conn.user.id
      }
    )

  return await conn.relayMessage(
    m.chat,
    newMsg.message,
    {
      messageId:
        newMsg.key.id
    }
  )

}

      /* =======================
         NORMAL TEXT
      ======================= */

      return await conn.sendMessage(
        m.chat,
        {
          text: finalCaption,
          mentions: users
        },
        {
          quoted: fkontak
        }
      )

    } catch (e) {

      console.log(e)

      return conn.sendMessage(
        m.chat,
        {
          text:
          '❌ Error en hidetag.'
        },
        {
          quoted: m
        }
      )

    }

  }

}
