import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => {
    thumb = Buffer.from(buf)
  })
  .catch(() => null)

export default {

  name: 'demote',
  command: ['demote', 'degradar'],
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

        const number = text.replace(/[^0-9]/g, '')

        if (number.length < 7) {
          return conn.sendMessage(m.chat, {
            text: '❌ Número inválido'
          }, { quoted: fkontak })
        }

        user = number + '@s.whatsapp.net'
      }

      if (!user) {
        return conn.sendMessage(m.chat, {
          text: '> ➤ Menciona o responde a un admin para degradarlo 🍭'
        }, { quoted: fkontak })
      }

      user = conn.decodeJid(user)

      // =========================
      // 🔍 BUSCAR USUARIO EN GRUPO
      // =========================
      const target = participants.find(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

      if (!target) {
        return conn.sendMessage(m.chat, {
          text: '❌ Usuario no encontrado en el grupo'
        }, { quoted: fkontak })
      }

      // =========================
      // 👑 VALIDAR ADMIN
      // =========================
      const isAdmin =
        target.admin === 'admin' ||
        target.admin === 'superadmin'

      if (!isAdmin) {
        return conn.sendMessage(m.chat, {
          text: '❌ Este usuario no es administrador'
        }, { quoted: fkontak })
      }

      // =========================
      // 🚫 PROTECCIONES
      // =========================
      const ownerGroup =
        metadata.owner ||
        m.chat.split('-')[0] + '@s.whatsapp.net'

      if (user === ownerGroup) {
        return conn.sendMessage(m.chat, {
          text: '🚫 No puedes degradar al owner del grupo'
        }, { quoted: fkontak })
      }

      if (user === conn.user.jid) {
        return conn.sendMessage(m.chat, {
          text: '🚫 No puedo degradarme a mí mismo'
        }, { quoted: fkontak })
      }

      // =========================
      // 🔻 DEMOTE
      // =========================
      await conn.groupParticipantsUpdate(
        m.chat,
        [user],
        'demote'
      )

      return conn.sendMessage(m.chat, {
        text: `🍭 USUARIO DEGRADADO\n\n👤 Usuario: @${user.split('@')[0]}\n📉 Estado: Ya no es administrador`,
        mentions: [user]
      }, { quoted: fkontak })

    } catch (e) {

      console.log(e)

      return conn.sendMessage(m.chat, {
        text: '🚫 Error al degradar usuario'
      }, { quoted: m })
    }
  }
}
