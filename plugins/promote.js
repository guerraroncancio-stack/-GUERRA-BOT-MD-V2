async function run(m, { conn, text }) {

  try {

    if (!m.isGroup)
      return m.reply('❌ Solo funciona en grupos')

    let user =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      null

    // =========================
    // 🔥 SI VIENE POR TEXTO
    // =========================
    if (!user && text) {

      const clean = text
        .replace(/[^0-9]/g, '')

      if (clean.length < 7)
        return m.reply('❌ Número inválido')

      user = clean + '@s.whatsapp.net'
    }

    if (!user)
      return conn.reply(
        m.chat,
        '> ➤ MENCIONA O RESPONDE A UN USUARIO PARA PROMOVERLO 👑',
        m
      )

    // =========================
    // 🔥 VALIDACIÓN BÁSICA
    // =========================
    const metadata =
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    const exists =
      participants.some(p =>
        conn.decodeJid(p.id || p.jid || p.participant) === user
      )

    if (!exists)
      return m.reply('❌ Ese usuario no está en el grupo')

    // =========================
    // 🔥 PROMOTE REAL
    // =========================
    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'promote'
    )

    return conn.reply(
      m.chat,
      '✅ Usuario promovido a admin correctamente',
      m
    )

  } catch (e) {

    console.log(e)

    return conn.reply(
      m.chat,
      '🚫 Error al promover usuario',
      m
    )
  }
}

export default {

  name: 'promote',
  command: ['promote', 'admin'],
  tags: ['group'],
  group: true,
  admin: true,
  botAdmin: true,
  run
}
