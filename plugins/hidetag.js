import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

// =========================
// 🔥 UNWRAP REAL BAILEYS
// =========================
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

// =========================
// 🔥 TEXT EXTRACTOR
// =========================
function getMessageText(m) {
  const msg = unwrapMessage(m.message) || {}
  return (
    m.text ||
    m.msg?.caption ||
    msg?.extendedTextMessage?.text ||
    msg?.conversation ||
    ''
  )
}

// =========================
// 🔥 MEDIA DOWNLOADER
// =========================
async function downloadMedia(msgContent, type) {
  try {
    const stream = await downloadContentFromMessage(msgContent, type)
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream)
      buffer = Buffer.concat([buffer, chunk])
    return buffer
  } catch {
    return null
  }
}

// =========================
// 🔥 HANDLER
// =========================
async function run(m, { conn, groupMetadata }) {

  try {

    if (!m.isGroup) return

    // 🔥 FIX 1: SIEMPRE metadata fallback
    const metadata =
      groupMetadata ||
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    if (!participants.length) return

    const content = getMessageText(m)

    // 🔥 comando
    if (!/^\.?n(\s|$)/i.test(content.trim())) return

    const userText =
      content.replace(/^\.?n(\s|$)/i, '').trim()

    // =========================
    // 🔥 USERS FIXED
    // =========================
    const users = []
    const seen = new Set()

    for (const p of participants) {
      const jid = conn.decodeJid(p.id || p.jid || p.participant)
      if (jid && !seen.has(jid)) {
        seen.add(jid)
        users.push(jid)
      }
    }

    if (!users.length) return

    await conn.sendMessage(m.chat, {
      react: { text: '👑', key: m.key }
    })

    const q =
      m.quoted
        ? unwrapMessage(m.quoted)
        : unwrapMessage(m.message)

    const mtype =
      Object.keys(q?.message || {})[0] || ''

    const isMedia =
      ['imageMessage','videoMessage','audioMessage','stickerMessage']
      .includes(mtype)

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑'

    const originalCaption =
      q?.msg?.caption ||
      q?.text ||
      ''

    const finalCaption =
      userText
        ? `${userText}\n\n${watermark}`
        : originalCaption
          ? `${originalCaption}\n\n${watermark}`
          : watermark

    // =========================
    // 🔥 MEDIA MODE FIXED
    // =========================
    if (isMedia) {

      let buffer = null

      try {
        if (q?.[mtype]) {
          const type = mtype.replace('Message', '').toLowerCase()
          buffer = await downloadMedia(q[mtype], type)
        }

        if (!buffer && q?.download) {
          buffer = await q.download()
        }
      } catch {}

      if (!buffer) {
        return conn.sendMessage(m.chat, {
          text: finalCaption,
          mentions: users
        }, { quoted: m })
      }

      const msg = { mentions: users }

      if (mtype === 'imageMessage') {
        msg.image = buffer
        msg.caption = finalCaption

      } else if (mtype === 'videoMessage') {
        msg.video = buffer
        msg.caption = finalCaption
        msg.mimetype = 'video/mp4'

      } else if (mtype === 'audioMessage') {
        msg.audio = buffer
        msg.mimetype = 'audio/mpeg'
        msg.ptt = false

      } else if (mtype === 'stickerMessage') {
        msg.sticker = buffer
      }

      return conn.sendMessage(m.chat, msg, { quoted: m })
    }

    // =========================
    // 🔥 TEXT MODE
    // =========================
    return conn.sendMessage(m.chat, {
      text: finalCaption,
      mentions: users
    }, { quoted: m })

  } catch (e) {

    console.log(e)

    return conn.sendMessage(m.chat, {
      text: '> GUERRA 𝐁𝐎𝐓 👑'
    }, { quoted: m })
  }
}

export default {
  name: 'notify',
  command: ['n'],
  tags: ['group'],
  group: true,
  admin: true,
  run
}
