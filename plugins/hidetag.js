import {
  generateWAMessageFromContent,
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(res => res.arrayBuffer())
  .then(buf => {
    thumb = Buffer.from(buf)
  })
  .catch(() => null)

function unwrapMessage(msg = {}) {
  let m = msg

  while (
    m?.ephemeralMessage?.message ||
    m?.viewOnceMessage?.message ||
    m?.viewOnceMessageV2?.message ||
    m?.viewOnceMessageV2Extension?.message
  ) {
    m =
      m.ephemeralMessage?.message ||
      m.viewOnceMessage?.message ||
      m.viewOnceMessageV2?.message ||
      m.viewOnceMessageV2Extension?.message
  }

  return m
}

function getText(m) {
  const msg = unwrapMessage(m.message || {})

  return (
    m.text ||
    m.body ||
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    ''
  )
}

async function downloadMedia(message, type) {
  try {
    const stream = await downloadContentFromMessage(message, type)

    let buffer = Buffer.alloc(0)

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
  } catch {
    return null
  }
}

export default async function hidetag(conn, m, chatUpdate) {

  try {

    if (!m?.isGroup) return

    const text = getText(m).trim()

    if (!/^\.?n(\s|$)/i.test(text)) return

    const metadata = await conn.groupMetadata(m.chat)

    const participants = metadata.participants || []

    const sender =
      participants.find(p => p.id === m.sender) || {}

    const bot =
      participants.find(p => p.id === conn.user.id) || {}

    const isAdmin = sender.admin
    const isBotAdmin = bot.admin

    if (!isAdmin) {
      return await conn.sendMessage(
        m.chat,
        {
          text: '❌ Solo admins pueden usar este comando.'
        },
        { quoted: m }
      )
    }

    if (!isBotAdmin) {
      return await conn.sendMessage(
        m.chat,
        {
          text: '⚠️ El bot necesita admin.'
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '👑',
          key: m.key
        }
      }
    )

    const users = participants.map(p => p.id)

    const quoted = m.quoted || m
    const qmsg = unwrapMessage(quoted.message || {})

    const mtype =
      Object.keys(qmsg || {})[0] || ''

    const userText =
      text.replace(/^\.?n(\s|$)/i, '').trim()

    const watermark = '> GUERRA BOT 👑'

    const caption =
      userText
        ? `${userText}\n\n${watermark}`
        : watermark

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

    /* =========================
       IMAGE
    ========================= */

    if (mtype === 'imageMessage') {

      const buffer = await downloadMedia(
        qmsg.imageMessage,
        'image'
      )

      return await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption,
          mentions: users
        },
        { quoted: fkontak }
      )
    }

    /* =========================
       VIDEO
    ========================= */

    if (mtype === 'videoMessage') {

      const buffer = await downloadMedia(
        qmsg.videoMessage,
        'video'
      )

      return await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          caption,
          mentions: users,
          mimetype: 'video/mp4'
        },
        { quoted: fkontak }
      )
    }

    /* =========================
       AUDIO
    ========================= */

    if (mtype === 'audioMessage') {

      const buffer = await downloadMedia(
        qmsg.audioMessage,
        'audio'
      )

      return await conn.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          mentions: users
        },
        { quoted: fkontak }
      )
    }

    /* =========================
       STICKER
    ========================= */

    if (mtype === 'stickerMessage') {

      const buffer = await downloadMedia(
        qmsg.stickerMessage,
        'sticker'
      )

      return await conn.sendMessage(
        m.chat,
        {
          sticker: buffer,
          mentions: users
        },
        { quoted: fkontak }
      )
    }

    /* =========================
       TEXT
    ========================= */

    if (quoted && quoted !== m) {

      const newMsg = generateWAMessageFromContent(
        m.chat,
        {
          extendedTextMessage: {
            text: caption,
            contextInfo: {
              mentionedJid: users
            }
          }
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
          messageId: newMsg.key.id
        }
      )
    }

    return await conn.sendMessage(
      m.chat,
      {
        text: caption,
        mentions: users
      },
      { quoted: fkontak }
    )

  } catch (err) {

    console.log(err)

    return await conn.sendMessage(
      m.chat,
      {
        text: '❌ Error en hidetag.'
      },
      { quoted: m }
    )
  }
}
