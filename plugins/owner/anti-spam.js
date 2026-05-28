```js
const antiSpamGroup = {

  name: 'antispam',

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

      // =====================================
      // 🚫 SOLO GRUPOS
      // =====================================

      if (!m.isGroup) return false
      if (!m.sender) return false
      if (!m.message) return false

      // =====================================
      // 👑 IGNORAR OWNERS
      // =====================================

      if (isOwner || isROwner)
      return false

      // =====================================
      // 👑 IGNORAR ADMINS
      // =====================================

      if (isAdmin)
      return false

      // =====================================
      // 🤖 BOT ADMIN
      // =====================================

      if (!isBotAdmin)
      return false

      // =====================================
      // 🔥 DATABASE FIX
      // =====================================

      global.db.data ||= {}
      global.db.data.chats ||= {}
      global.db.data.users ||= {}

      global.db.data.chats[m.chat] ||= {}
      global.db.data.users[m.sender] ||= {}

      const chat =
      global.db.data.chats[m.chat]

      const user =
      global.db.data.users[m.sender]

      // =====================================
      // ⚙️ ACTIVAR ANTI-SPAM
      // =====================================

      if (
        typeof chat.antiSpam !==
        'boolean'
      ) {

        chat.antiSpam = true

      }

      if (!chat.antiSpam)
      return false

      // =====================================
      // 📊 CONTROL SPAM
      // =====================================

      const now = Date.now()

      user.groupSpamData ||= {
        count: 0,
        time: now
      }

      // =====================================
      // 🔄 RESET 3 MIN
      // =====================================

      if (
        now -
        user.groupSpamData.time >
        180000
      ) {

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

      // =====================================
      // ➕ SUMAR
      // =====================================

      user.groupSpamData.count++

      // =====================================
      // 🚨 LIMITE
      // =====================================

      const LIMIT = 50

      if (
        user.groupSpamData.count >=
        LIMIT
      ) {

        // =====================================
        // 📢 AVISO
        // =====================================

        await conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚨 ANTI SPAM 🚨 〕━━⬣
┃
┃ ❌ Usuario eliminado
┃ por spam excesivo
┃
┃ 👤 Usuario:
┃ ➥ @${m.sender.split('@')[0]}
┃
┃ 📊 Mensajes:
┃ ➥ ${user.groupSpamData.count}
┃
┃ ⚠️ Límite:
┃ ➥ ${LIMIT}
┃
╰━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [m.sender]
          },
          { quoted: m }
        )

        // =====================================
        // ❌ REMOVE
        // =====================================

        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        // =====================================
        // 🔄 RESET
        // =====================================

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

    } catch {

      // 🔥 SILENCIOSO
      // NO MANDA NADA A CONSOLA

    }

    return false

  }

}

export default antiSpamGroup
```
