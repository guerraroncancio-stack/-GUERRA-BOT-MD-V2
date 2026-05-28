const antiSpamGroup = {

  name: 'antispam',

  description: 'Sistema anti spam',

  version: '1.0.0',

  before: true,

  async run() {},

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

      if (!m.isGroup) return false
      if (!m.sender) return false
      if (!m.message) return false

      // 👑 OWNERS
      if (isOwner || isROwner)
      return false

      // 👑 ADMINS
      if (isAdmin)
      return false

      // 🤖 BOT ADMIN
      if (!isBotAdmin)
      return false

      // 🔥 DATABASE
      global.db.data =
      global.db.data || {}

      global.db.data.chats =
      global.db.data.chats || {}

      global.db.data.users =
      global.db.data.users || {}

      if (!global.db.data.chats[m.chat]) {

        global.db.data.chats[m.chat] = {}

      }

      if (!global.db.data.users[m.sender]) {

        global.db.data.users[m.sender] = {}

      }

      const chat =
      global.db.data.chats[m.chat]

      const user =
      global.db.data.users[m.sender]

      // ⚙️ ACTIVAR
      if (
        !('antiSpam' in chat)
      ) {

        chat.antiSpam = true

      }

      if (!chat.antiSpam)
      return false

      // ⏳ TIME
      const now = Date.now()

      // 📊 DATA
      if (!user.groupSpamData) {

        user.groupSpamData = {
          count: 0,
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
        user.groupSpamData.time = now

      }

      // ➕ COUNT
      user.groupSpamData.count += 1

      // 🚨 SPAM
      if (
        user.groupSpamData.count > 50
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

        // ❌ REMOVE
        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        // 🔄 RESET
        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

    } catch {}

    return false

  }

}

export default antiSpamGroup
```
