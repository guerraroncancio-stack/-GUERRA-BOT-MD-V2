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

      if (isOwner || isROwner)
      return false

      if (isAdmin)
      return false

      if (!isBotAdmin)
      return false

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

      if (
        !('antiSpam' in chat)
      ) {

        chat.antiSpam = true

      }

      if (!chat.antiSpam)
      return false

      const now = Date.now()

      if (!user.groupSpamData) {

        user.groupSpamData = {
          count: 0,
          time: now
        }

      }

      if (
        now -
        user.groupSpamData.time >
        180000
      ) {

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

      user.groupSpamData.count += 1

      if (
        user.groupSpamData.count > 50
      ) {

        await conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚨 ANTI SPAM 🚨 〕━━⬣
┃
┃ Usuario eliminado
┃ por exceso de spam.
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

        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

    } catch {}

    return false

  }

}

export default antiSpamGroup
```
