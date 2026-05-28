const antiSpamGroup = {
  name: 'antispam',
  description: 'Sistema anti spam',
  version: '1.0.0',

  async before(
    m,
    {
      conn,
      isAdmin,
      isBotAdmin,
      isOwner,
      isROwner
    }
  ) {

    try {

      // 🚫 SOLO GRUPOS
      if (!m.isGroup) return

      // 🚫 SIN MENSAJE
      if (!m.sender) return
      if (!m.message) return

      // 👑 IGNORAR OWNERS
      if (isOwner || isROwner)
      return

      // 👑 IGNORAR ADMINS
      if (isAdmin)
      return

      // 🤖 BOT ADMIN
      if (!isBotAdmin)
      return

      // 🔥 DATABASE FIX
      if (!global.db)
      global.db = {}

      if (!global.db.data)
      global.db.data = {}

      if (!global.db.data.chats)
      global.db.data.chats = {}

      if (!global.db.data.users)
      global.db.data.users = {}

      // 📂 CHAT
      if (!global.db.data.chats[m.chat]) {

        global.db.data.chats[m.chat] = {
          antiSpam: true
        }

      }

      // 👤 USER
      if (!global.db.data.users[m.sender]) {

        global.db.data.users[m.sender] = {}

      }

      const chat =
      global.db.data.chats[m.chat]

      const user =
      global.db.data.users[m.sender]

      // 🚫 DESACTIVADO
      if (!chat.antiSpam)
      return

      const now = Date.now()

      // 📊 DATA
      if (!user.groupSpamData) {

        user.groupSpamData = {
          count: 0,
          warned: false,
          time: now
        }

      }

      // 🔄 RESET 3 MIN
      if (
        now -
        user.groupSpamData.time >
        180000
      ) {

        user.groupSpamData.count = 0
        user.groupSpamData.warned = false
        user.groupSpamData.time = now

      }

      // ➕ SUMAR
      user.groupSpamData.count += 1

      // ⚠️ AVISO EN 10
      if (
        user.groupSpamData.count >= 10 &&
        user.groupSpamData.warned === false
      ) {

        user.groupSpamData.warned = true

        await conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 ⚠️ ANTI SPAM ⚠️ 〕━━⬣
┃
┃ 👤 Usuario:
┃ ➥ @${m.sender.split('@')[0]}
┃
┃ 📊 Mensajes:
┃ ➥ ${user.groupSpamData.count}/50
┃
┃ 🚫 El anti spam elimina
┃ usuarios automáticamente
┃ por exceso de mensajes.
┃
┃ ⚡ Reduce el spam.
┃
╰━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [m.sender]
          },
          { quoted: m }
        )

      }

      // 🚨 ELIMINAR
      if (
        user.groupSpamData.count >= 50
      ) {

        await conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚨 ANTI SPAM 🚨 〕━━⬣
┃
┃ ❌ Usuario eliminado
┃ por exceso de spam
┃
┃ 👤 Usuario:
┃ ➥ @${m.sender.split('@')[0]}
┃
┃ 📊 Mensajes:
┃ ➥ ${user.groupSpamData.count}
┃
╰━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [m.sender]
          },
          { quoted: m }
        )

        // ❌ KICK
        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        // 🔄 RESET
        user.groupSpamData.count = 0
        user.groupSpamData.warned = false
        user.groupSpamData.time = now

      }

    } catch (e) {

      console.log(
        '[ ANTI-SPAM ERROR ]'
      )

      console.log(e)

    }

  }

}

export default antiSpamGroup
