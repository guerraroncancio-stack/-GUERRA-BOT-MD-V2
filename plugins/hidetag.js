import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'
import Buffer from 'buffer'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

// =========================
// 🔥 UTILIDADES
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
// 🔥 HANDLER
// =========================

async function run(m, { conn, groupMetadata }) {

  try {

    if (!m.isGroup) return

    const metadata =
      groupMetadata ||
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    if (!participants.length) {
      return m.reply('❌ No hay miembros en el grupo')
    }

    const content = getMessageText(m)

    // 🔥 comando: .n mensaje
    if (!content.startsWith('.n')) return

    const message =
      content.replace('.n', '').trim()

    const users = participants
      .map(p => conn.decodeJid(p.id || p.jid || p.participant))
      .filter(Boolean)

    if (!users.length) {
      return m.reply('❌ No se pudieron obtener usuarios')
    }

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑'

    const finalText =
      message
        ? `📢 NOTIFICACIÓN\n\n${message}\n\n${watermark}`
        : `📢 NOTIFICACIÓN\n\n${watermark}`

    // =========================
    // 🔥 NOTIFICADOR REAL
    // =========================

    await conn.sendMessage(m.chat, {
      text: finalText,
      mentions: users   // 🔥 FIX IMPORTANTE
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
  tags: ['groups'],
  command: ['n'],
  group: true,
  admin: true,
  run
}
