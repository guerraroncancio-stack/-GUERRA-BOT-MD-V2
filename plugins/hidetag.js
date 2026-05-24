import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

let thumb = null
fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

// =========================
// UTILS
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
// RUN (CORE FRIENDLY)
// =========================

export async function run(m, { conn, participants }) {
  try {
    if (!m.isGroup) return

    const text = getMessageText(m).trim()

    // 🔥 DETECTOR REAL SIN HANDLER
    if (!text.startsWith('.n')) return

    const message = text.slice(2).trim()

    const users = []
    const seen = new Set()

    for (const p of participants || []) {
      const jid = conn.decodeJid(p.id || p.jid || p.participant)
      if (jid && !seen.has(jid)) {
        seen.add(jid)
        users.push(jid)
      }
    }

    if (!users.length) return

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑'

    const finalText = message
      ? `📢 NOTIFICACIÓN\n\n${message}\n\n${watermark}`
      : `📢 NOTIFICACIÓN\n\n${watermark}`

    await conn.sendMessage(m.chat, {
      text: finalText,
      mentions: users
    }, { quoted: m })

  } catch (e) {
    console.log(e)
  }
}
