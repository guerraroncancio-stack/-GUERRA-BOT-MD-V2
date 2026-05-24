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

async function downloadMedia(msgContent, type) {
  try {
    const stream = await downloadContentFromMessage(msgContent, type)
    let buffer = Buffer.alloc(0)

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
  } catch {
    return null
  }
}

async function run(m, { conn, groupMetadata, text }) {

  try {

    if (!m.isGroup) return

    const metadata =
      groupMetadata ||
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    if (!participants.length) return

    const content = getMessageText(m)

    // 🔥 comando simple: ".n mensaje"
    if (!/^\.?n(\s|$)/i.test(content.trim())) return

    const message =
      content.replace(/^\.?n(\s|$)/i, '').trim()

    const users = participants
      .map(p => conn.decodeJid(p.id || p.jid || p.participant))
      .filter(Boolean)

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑'

    const finalText =
      message
        ? `📢 NOTIFICACIÓN\n\n${message}\n\n${watermark}`
        : `📢 NOTIFICACIÓN\n\n${watermark}`

    // =========================
    // 🔥 SOLO MENSAJE (NOTIFIER REAL)
    // =========================

    await conn.sendMessage(m.chat, {
      text: finalText
    }, { quoted: m })

  } catch (e) {

    console.log(e)

    return conn.sendMessage(m.chat, {
      text: '> GUERRA 𝐁𝐎𝐓 👑',
      mentions: []
    }, { quoted: m })
  }
}

export default {

  name: 'notify',
  tags: ['groups'],
  command: ['n'],
  group: true,
  admin: true,
  run
}
