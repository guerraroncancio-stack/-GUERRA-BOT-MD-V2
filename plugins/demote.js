import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

async function handler(m, { conn, text }) {

  try {

    if (!m.isGroup)
      return m.reply('❌ Solo funciona en grupos')

    let user =
      m.quoted?.sender ||
      m.mentionedJid?.[0] ||
      null

    if (!user && text) {
      const num = text.replace(/[^0-9]/g, '')
      if (num.length >= 10) {
        user = num + '@s.whatsapp.net'
      }
    }

    if (!user)
      return conn.reply(
        m.chat,
        '> ➤ MENCIONA O RESPONDE A UN ADMIN PARA DEGRADARLO 🍭',
        m
      )

    const metadata =
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    // =========================
    // 🔥 BUSCAR USUARIO REAL
    // =========================
    const target =
      participants.find(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

    if (!target)
      return m.reply('❌ Usuario no encontrado en el grupo')

    // =========================
    // 🔥 DETECTAR ADMIN REAL (FIX IMPORTANTE)
    // =========================
    const isAdmin =
      target?.admin === 'admin' ||
      target?.admin === 'superadmin'

    if (!isAdmin)
      return m.reply('❌ Este usuario NO es admin')

    // =========================
    // 🔥 PROTECCIONES
    // =========================
    if (user === conn.user.jid)
      return m.reply('🚫 No puedo degradar al bot')

    const ownerGroup =
      metadata.owner ||
      m.chat.split`-`[0] + '@s.whatsapp.net'

    if (user === ownerGroup)
      return m.reply('🚫 No puedo degradar al owner del grupo')

    // =========================
    // 🔥 DEMOTE REAL
    // =========================
    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'demote'
    )

    return conn.sendMessage(m.chat, {
      image: thumb || undefined,
      caption: `> ➤ USUARIO DEGRADADO CON ÉXITO 🍭\n\n👤 @${user.split('@')[0]}`,
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
