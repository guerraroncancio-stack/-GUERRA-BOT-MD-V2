import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => {
    thumb = Buffer.from(buf)
  })
  .catch(() => null)

export default {

  name: 'promote',
  command: ['promote', 'admin'],
  tags: ['group'],
  group: true,
  admin: true,
  botAdmin: true,

  async run(m, { conn, text }) {

    try {

      if (!m.isGroup) {
        return m.reply('❌ Solo funciona en grupos')
      }

      const metadata = await conn.groupMetadata(m.chat)
      const participants = metadata.participants || []

      const fkontak = {
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: 'Guerra'
        },
        message: {
          locationMessage: {
            name: '👑 GUERRA BOT ',
            jpegThumbnail: thumb
          }
        },
        participant: '0@s.whatsapp.net'
      }

      // =========================
      // 🔥 OBTENER USUARIO
      // =========================
     let user =
  m.quoted?.sender ||
  m.quoted?.participant ||
  m.quoted?.key?.participant ||
  m.mentionedJid?.[0] ||
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
          text: '> ➤ Menciona o responde a un usuario para promoverlo 👑'
        }, { quoted: fkontak })
      }

      user = conn.decodeJid(user)

      // =========================
      // 🔥 VALIDACIÓN EN GRUPO (SIN ONWHATSAPP = SIN BUG)
      // =========================
      const exists = participants.some(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

      if (!exists) {
        return conn.sendMessage(m.chat, {
          text: '❌ Ese usuario no está en el grupo'
        }, { quoted: fkontak })
      }

      // =========================
      // 👑 PROMOTE
      // =========================
      await conn.groupParticipantsUpdate(
        m.chat,
        [user],
        'promote'
      )

      return conn.sendMessage(m.chat, {
        text: '👑 Usuario promovido a administrador correctamente'
      }, { quoted: fkontak })

    } catch (e) {

      console.log(e)

      return conn.sendMessage(m.chat, {
        text: '🚫 Error al promover usuario'
      }, { quoted: m })
    }
  }
}
