import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

async function handler(m, { conn, text }) {

  let user = null

  // =========================
  // 🔥 DETECCIÓN DE USUARIO
  // =========================
  if (m.quoted?.sender) {
    user = m.quoted.sender

  } else if (m.mentionedJid?.length) {
    user = m.mentionedJid[0]

  } else if (text) {
    const number = text.replace(/[^0-9]/g, '')
    if (number.length >= 11 && number.length <= 13) {
      user = number + '@s.whatsapp.net'
    }
  }

  if (!user) {
    return conn.reply(
      m.chat,
      '> ➤ MENCIONA O RESPONDE A UN ADMIN PARA DEGRADARLO 🍭',
      m
    )
  }

  try {

    const metadata =
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    const target =
      participants.find(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

    // =========================
    // 🔥 VALIDACIONES
    // =========================
    if (!target?.admin) {
      return conn.reply(
        m.chat,
        '❌ Este usuario no es admin',
        m
      )
    }

    if (user === conn.user.jid) {
      return m.reply('🚫 No puedo degradar al bot')
    }

    // =========================
    // 🔥 DEMOTE REAL
    // =========================
    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'demote'
    )

    // =========================
    // 🔥 RESPUESTA CON ESTILO
    // =========================
    return conn.sendMessage(m.chat, {
      image: thumb || undefined,
      caption: `> ➤『 USUARIO DEGRADADO CON ÉXITO 🍭 』\n\n👤 @${user.split('@')[0]}`,
      mentions: [user]
    }, { quoted: m })

  } catch (e) {

    console.log(e)

    return conn.reply(
      m.chat,
      '🚫 Error al degradar usuario',
      m
    )
  }
}

export default {

  name: 'demote',
  command: ['demote', 'degradar'],
  tags: ['group'],
  group: true,
  admin: true,
  botAdmin: true,
  run: handler
}
