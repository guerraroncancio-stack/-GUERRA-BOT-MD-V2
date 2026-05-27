import fetch from 'node-fetch'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => {
    thumb = Buffer.from(buf)
  })
  .catch(() => null)

// =========================
// 🔓 UNWRAP VIEWONCE / EPHEMERAL
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

export default {

  name: 'promote',
  alias: ['admin', 'daradmin', 'promover'],
  group: true,
  admin: true,
  botAdmin: true,

  async run(m, { conn, text }) {

    try {

      if (!m.isGroup) {
        return m.reply('❌ Solo funciona en grupos')
      }

      const metadata = await conn.groupMetadata(m.chat)
      const users = metadata.participants.map(p => p.id)

      // =========================
      // 👑 CONTEXTO STYLE (TIPO HIDETAG)
      // =========================
      const fkontak = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: 'Guerra'
        },
        message: {
          locationMessage: {
            name: '👑 GUERRA BOT - PROMOTE SYSTEM',
            jpegThumbnail: thumb
          }
        },
        participant: '0@s.whatsapp.net'
      }

      let user =
        m.mentionedJid?.[0] ||
        m.quoted?.sender ||
        null

      // =========================
      // 🔥 SI VIENE POR TEXTO
      // =========================
      if (!user && text) {

        const clean = text.replace(/[^0-9]/g, '')

        if (clean.length < 7) {
          return conn.sendMessage(m.chat, {
            text: '❌ Número inválido'
          }, { quoted: fkontak })
        }

        user = clean + '@s.whatsapp.net'
      }

      if (!user) {
        return conn.sendMessage(m.chat, {
          text: '➤ Menciona o responde a un usuario para promoverlo 👑'
        }, { quoted: fkontak })
      }

      // =========================
      // 🔍 VERIFICACIÓN WHATSAPP
      // =========================
      const [wa] = await conn.onWhatsApp(user)

      if (!wa?.exists) {
        return conn.sendMessage(m.chat, {
          text: '❌ Este número no está registrado en WhatsApp'
        }, { quoted: fkontak })
      }

      // =========================
      // 👥 VALIDACIÓN GRUPO
      // =========================
      const exists = metadata.participants.some(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

      if (!exists) {
        return conn.sendMessage(m.chat, {
          text: '❌ Ese usuario no está en el grupo'
        }, { quoted: fkontak })
      }

      // =========================
      // 👑 PROMOTE REAL
      // =========================
      await conn.groupParticipantsUpdate(
        m.chat,
        [user],
        'promote'
      )

      // =========================
      // ✅ RESPUESTA FINAL PRO
      // =========================
      return conn.sendMessage(m.chat, {
        text: `👑 *USUARIO PROMOVIDO*\n\n✔️ Estado: Administrador agregado\n✔️ Acción: Promote ejecutado correctamente\n✔️ Sistema: GUERRA BOT`,
        mentions: users
      }, { quoted: fkontak })

    } catch (e) {

      console.log(e)

      return conn.sendMessage(m.chat, {
        text: '🚫 Error al promover usuario'
      }, { quoted: m })
    }
  }
}
