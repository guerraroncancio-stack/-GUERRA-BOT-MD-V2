const antiSpamGroup = {

  name: 'antiSpamGroup',

  async before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {

    try {

      // =========================================
      // 🚫 SOLO GRUPOS
      // =========================================

      if (!m.isGroup) return false
      if (!m.sender) return false
      if (!m.message) return false

      // =========================================
      // 👑 IGNORAR OWNERS
      // =========================================

      if (isOwner || isROwner) return false

      // =========================================
      // 👑 IGNORAR ADMINS
      // =========================================

      if (isAdmin) return false

      // =========================================
      // 🤖 BOT ADMIN
      // =========================================

      if (!isBotAdmin) return false

      // =========================================
      // 🔥 DATABASE FIX
      // =========================================

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

      // =========================================
      // ⚙️ ACTIVAR / DESACTIVAR
      // =========================================

      if (!('antiSpam' in chat)) {

        chat.antiSpam = true

      }

      if (!chat.antiSpam) return false

      // =========================================
      // 📊 CONTADOR
      // =========================================

      const now = Date.now()

      if (!user.groupSpamData) {

        user.groupSpamData = {
          count: 0,
          time: now
        }

      }

      // =========================================
      // ⏳ RESET CADA 3 MIN
      // =========================================

      if (
        now - user.groupSpamData.time >
        3 * 60 * 1000
      ) {

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

      // =========================================
      // ➕ SUMAR MENSAJE
      // =========================================

      user.groupSpamData.count += 1

      // =========================================
      // 🚨 SPAM DETECTADO
      // =========================================

      if (user.groupSpamData.count > 50) {

        const reason =
        '🚫 SPAM EXCESIVO'

        // =========================================
        // 📢 AVISO
        // =========================================

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
┃ 📝 Motivo:
┃ ➥ ${reason}
┃
╰━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [m.sender]
          },
          { quoted: m }
        )

        // =========================================
        // ❌ ELIMINAR
        // =========================================

        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        // =========================================
        // 🔄 RESET
        // =========================================

        user.groupSpamData.count = 0
        user.groupSpamData.time = now

      }

    } catch (e) {

      console.log(
        '[ ANTI-SPAM ERROR ]'
      )

      console.log(e)

    }

    return false

  }

}

export default antiSpamGroup
