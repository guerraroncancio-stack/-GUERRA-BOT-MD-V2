const antiSpamGroup = {
  name: 'antispam',
  description: 'Sistema anti spam',
  version: '1.0.1',

  async before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    try {

      // 🚫 SOLO GRUPOS
      if (!m.isGroup) return false

      // 🚫 VALIDACIÓN BÁSICA
      if (!m.sender || !m.message) return false

      // 👑 IGNORAR OWNERS
      if (isOwner || isROwner) return false

      // 👮 IGNORAR ADMINS
      if (isAdmin) return false

      // 🤖 NECESARIO PARA KICK
      if (!isBotAdmin) return false

      // 📦 INIT DB 100% SEGURO (FIX REAL)
      global.db ||= {}
      global.db.data ||= {}
      global.db.data.chats ||= {}
      global.db.data.users ||= {}

      // 📂 CHAT INIT
      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { antiSpam: true }
      }

      // 👤 USER INIT
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
      }

      const chat = global.db.data.chats[m.chat]
      const user = global.db.data.users[m.sender]

      // 🚫 SISTEMA DESACTIVADO
      if (!chat.antiSpam) return false

      const now = Date.now()

      // 📊 INIT DATA
      user.groupSpamData ||= {
        count: 0,
        time: now,
        warned: false
      }

      // 🔄 RESET CADA 3 MIN
      if (now - user.groupSpamData.time > 180000) {
        user.groupSpamData.count = 0
        user.groupSpamData.warned = false
        user.groupSpamData.time = now
      }

      user.groupSpamData.count++

      // ⚠️ WARNING
      if (
        user.groupSpamData.count === 10 &&
        !user.groupSpamData.warned
      ) {

        user.groupSpamData.warned = true

        await conn.sendMessage(m.chat, {
          text:
`╭━━〔 ⚠️ ANTI SPAM 〕━━⬣
┃ 👤 @${m.sender.split('@')[0]}
┃ 📊 Mensajes: ${user.groupSpamData.count}
┃ ⚡ Reduce la velocidad de mensajes
╰━━━━━━━━━━━━⬣`,
          mentions: [m.sender]
        }, { quoted: m })
      }

      // 🚨 KICK
      if (user.groupSpamData.count >= 50) {

        await conn.sendMessage(m.chat, {
          text:
`╭━━〔 🚨 ANTI SPAM 🚨 〕━━⬣
┃ ❌ Usuario expulsado
┃ 👤 @${m.sender.split('@')[0]}
┃ 📊 Mensajes: ${user.groupSpamData.count}
╰━━━━━━━━━━━━⬣`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.groupParticipantsUpdate(
          m.chat,
          [m.sender],
          'remove'
        )

        // reset seguro
        user.groupSpamData = {
          count: 0,
          time: now,
          warned: false
        }
      }

    } catch (e) {
      console.log('[ANTI-SPAM ERROR]', e)
    }

    return false
  }
}

export default antiSpamGroup
