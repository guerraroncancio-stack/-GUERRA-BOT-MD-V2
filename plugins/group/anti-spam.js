export default {
  name: "antispam",

  async run() {},

  async before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (!m.isGroup) return

    global.db ||= {}
    global.db.data ||= {}
    global.db.data.chats ||= {}
    global.db.data.users ||= {}

    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = { antiSpam: true }
    }

    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = {}
    }

    const chat = global.db.data.chats[m.chat]
    if (!chat.antiSpam) return

    const user = global.db.data.users[m.sender]
    const now = Date.now()

    user.spam ||= { count: 0, time: now, warned: false }

    if (now - user.spam.time > 180000) {
      user.spam.count = 0
      user.spam.warned = false
      user.spam.time = now
    }

    user.spam.count++

    if (user.spam.count === 10 && !user.spam.warned) {
      user.spam.warned = true
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${m.sender.split('@')[0]} estás enviando muchos mensajes`,
        mentions: [m.sender]
      })
    }

    if (user.spam.count >= 50) {
      await conn.sendMessage(m.chat, {
        text: `🚨 @${m.sender.split('@')[0]} expulsado por spam`,
        mentions: [m.sender]
      })

      if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
      }

      user.spam = { count: 0, time: now, warned: false }
    }
  }
}
