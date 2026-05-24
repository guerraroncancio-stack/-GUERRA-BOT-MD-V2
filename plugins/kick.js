async function run(m, { conn, usedPrefix }) {

  try {

    if (!m.isGroup) {
      return m.reply('❌ Solo funciona en grupos')
    }

    // =========================
    // 🔥 OBTENER USUARIO
    // =========================
    const user =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      null

    if (!user) {
      return conn.reply(
        m.chat,
        '> ➤ MENCIONA O RESPONDE A UN USUARIO PARA EXPULSARLO 🌟',
        m
      )
    }

    const metadata =
      await conn.groupMetadata(m.chat)

    const ownerGroup =
      metadata?.owner ||
      m.chat.split`-`[0] + '@s.whatsapp.net'

    const ownerBot =
      global.owner?.[0]?.[0]
        ? global.owner[0][0] + '@s.whatsapp.net'
        : null

    // =========================
    // 🔥 VALIDACIONES
    // =========================
    if (user === conn.user.jid)
      return m.reply('🚫 No puedo expulsar al bot')

    if (user === ownerGroup)
      return m.reply('🚫 No puedo expulsar al owner del grupo')

    if (ownerBot && user === ownerBot)
      return m.reply('🚫 No puedo expulsar al owner del bot')

    // =========================
    // 🔥 KICK REAL
    // =========================
    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'remove'
    )

    return conn.reply(
      m.chat,
      `✅ Usuario expulsado correctamente`,
      m
    )

  } catch (e) {

    console.log(e)

    return conn.reply(
      m.chat,
      `🚫 Error al expulsar usuario\n\n${e.message || e}`,
      m
    )
  }
}

export default {

  name: 'kick',
  command: ['kick', 'ban', 'expulsar'],
  tags: ['group'],
  group: true,
  admin: true,
  botAdmin: true,
  run
}
