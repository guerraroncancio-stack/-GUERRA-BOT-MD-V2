import {
  generateWAMessageFromContent,
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
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

function getText(m) {

  const msg = unwrapMessage(m.message) || {}

  return (
    m.text ||
    m.body ||
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    ''
  )
}

async function downloadMedia(msg, type) {

  const stream =
    await downloadContentFromMessage(msg, type)

  let buffer = Buffer.alloc(0)

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  return buffer
}

export default {

  name: 'hidetag',

  async execute(m, { conn }) {

    try {

      if (!m.isGroup) return

      const text = getText(m).trim()

      if (!text.startsWith('.n')) return

      const metadata =
        await conn.groupMetadata(m.chat)

      const participants =
        metadata.participants || []

      const users =
        participants.map(v => v.id)

      const bot =
        metadata.participants.find(
          p => p.id === conn.user.id
        )

      const sender =
        metadata.participants.find(
          p => p.id === m.sender
        )

      if (!bot?.admin) {

        return conn.sendMessage(
          m.chat,
          {
            text: '❌ El bot necesita admin.'
          },
          { quoted: m }
        )

      }

      if (!sender?.admin) {

        return conn.sendMessage(
          m.chat,
          {
            text: '❌ Solo admins.'
          },
          { quoted: m }
        )

      }

      const quoted =
        m.quoted ? unwrapMessage(m.quoted) : null

      const userText =
        text.replace('.n', '').trim()

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

      if (!quoted) {

        return conn.sendMessage(
          m.chat,
          {
            text: userText || '‎',
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      const mtype =
        quoted.mtype ||
        Object.keys(quoted.message || {})[0]

      if (mtype === 'imageMessage') {

        const buffer =
          await downloadMedia(
            quoted.imageMessage,
            'image'
          )

        return conn.sendMessage(
          m.chat,
          {
            image: buffer,
            caption: userText || '',
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      if (mtype === 'videoMessage') {

        const buffer =
          await downloadMedia(
            quoted.videoMessage,
            'video'
          )

        return conn.sendMessage(
          m.chat,
          {
            video: buffer,
            caption: userText || '',
            mentions: users
          },
          { quoted: fkontak }
        )

      }

      if (mtype === 'audioMessage') {

        const buffer =
          await downloadMedia(
            quoted.audioMessage,
            'audio'
          )

        return conn.sendMessage(
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

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          extendedTextMessage: {
            text:
              userText ||
              quoted.text ||
              ''
          }
        },
        {
          quoted: fkontak,
          userJid: conn.user.id
        }
      )

      await conn.relayMessage(
        m.chat,
        msg.message,
        { messageId: msg.key.id }
      )

    } catch (e) {

      console.log(e)

      await conn.sendMessage(
        m.chat,
        {
          text: '❌ Error en hidetag.'
        },
        { quoted: m }
      )

    }

  }
}
