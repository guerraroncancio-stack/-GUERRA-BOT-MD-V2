import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys'

import fetch from 'node-fetch'

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

async function run(m, { conn, groupMetadata }) {

  try {

    if (!m.isGroup) return

    const metadata =
      groupMetadata ||
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    if (!participants.length)
      return m.reply('❌ No hay miembros en el grupo')

    const content = getMessageText(m)

    // 🔥 FIX REAL: evita falsos negativos
    if (!content.startsWith('.n')) return

    const message = content.slice(2).trim()

    const users = participants
      .map(p => conn.decodeJid(p.id || p.jid || p.participant))
      .filter(Boolean)

    if (!users.length)
      return m.reply('❌ No se pudieron obtener usuarios')

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑'

    const finalText =
      message
        ? `📢 NOTIFICACIÓN\n\n${message}\n\n${watermark}`
        : `📢 NOTIFICACIÓN\n\n${watermark}`

    // =========================
    // 🔥 FUNCIONAL REAL
    // =========================

    return await conn.sendMessage(m.chat, {
      text: finalText,
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
  tags: ['groups'],
  command: ['n'],
  group: true,
  admin: true,
  run
}
