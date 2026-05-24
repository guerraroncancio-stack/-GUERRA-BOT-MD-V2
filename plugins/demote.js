async function run(m, { conn, text }) {

  try {

    if (!m.isGroup)
      return m.reply('❌ Solo funciona en grupos')

    let user =
      m.quoted?.sender ||
      m.mentionedJid?.[0] ||
      null

    if (!user && text) {
      const number = text.replace(/[^0-9]/g, '')
      if (number.length >= 10) {
        user = number + '@s.whatsapp.net'
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

    const target =
      participants.find(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

    if (!target)
      return m.reply('❌ Usuario no encontrado en el grupo')

    const isAdmin =
      target?.admin === 'admin' ||
      target?.admin === 'superadmin'

    if (!isAdmin)
      return m.reply('❌ Este usuario no es admin')

    const ownerGroup =
      metadata.owner ||
      m.chat.split`-`[0] + '@s.whatsapp.net'

    if (user === ownerGroup)
      return m.reply('🚫 No puedes degradar al owner')

    if (user === conn.user.jid)
      return m.reply('🚫 No puedo degradarme')

    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'demote'
    )

    return conn.sendMessage(m.chat, {
      text: `> ➤ USUARIO DEGRADADO 🍭\n\n👤 @${user.split('@')[0]}`,
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
  run
}
