export default {
  name: "antispam",

  async run(m, { conn, text, isAdmin, isOwner }) {
    try {

      if (!m.isGroup) return

      global.db ||= {}
      global.db.data ||= {}
      global.db.data.chats ||= {}

      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { antiSpam: true }
      }

      const chat = global.db.data.chats[m.chat]

      const cmd = text?.toLowerCase().trim()

      // 📌 SOLO ADMINS / OWNERS PUEDEN CONFIGURAR
      if (!(isAdmin || isOwner)) {
        return await conn.sendMessage(m.chat, {
          text: `❌ Solo *admins* pueden usar este comando.`,
        }, { quoted: m })
      }

      // ⚙️ ACTIVAR
      if (cmd === "on") {
        chat.antiSpam = true
        return await conn.sendMessage(m.chat, {
          text:
`╭━━〔 🟢 ANTI SPAM 〕━━⬣
┃ ✔ Sistema activado
┃ 📊 Protección contra spam ON
╰━━━━━━━━━━━━⬣`
        }, { quoted: m })
      }

      // ⚙️ DESACTIVAR
      if (cmd === "off") {
        chat.antiSpam = false
        return await conn.sendMessage(m.chat, {
          text:
`╭━━〔 🔴 ANTI SPAM 〕━━⬣
┃ ✖ Sistema desactivado
┃ 📊 Protección contra spam OFF
╰━━━━━━━━━━━━⬣`
        }, { quoted: m })
      }

      // 📊 ESTADO
      return await conn.sendMessage(m.chat, {
        text:
`╭━━〔 ⚙️ ANTI SPAM 〕━━⬣
┃ 📊 Estado: ${chat.antiSpam ? "🟢 ACTIVO" : "🔴 INACTIVO"}
┃
┃ 🧩 Uso:
┃ ➤ antispam on
┃ ➤ antispam off
╰━━━━━━━━━━━━⬣`
      }, { quoted: m })

    } catch (e) {
      console.log(e)
    }
  },

  async before(m, { conn, isBotAdmin }) {
    try {

      if (!m.isGroup) return

      global.db ||= {}
      global.db.data ||= {}
      global.db.data.chats ||= {}
      global.db.data.users ||= {}

      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { antiSpam: true }
      }

      const chat = global.db.data.chats[m.chat]
      if (!chat.antiSpam) return

      const user = global.db.data.users[m.sender] ||= {}
      const now = Date.now()

      user.spam ||= { count: 0, time: now, warned: false }

      // ⏱ reset cada 3 min
      if (now - user.spam.time > 180000) {
        user.spam = { count: 0, time: now, warned: false }
      }

      user.spam.count++

      // ⚠️ WARNING
      if (user.spam.count === 10 && !user.spam.warned) {
        user.spam.warned = true

        await conn.sendMessage(m.chat, {
          text:
`╭━━〔 ⚠️ ANTI SPAM 〕━━⬣
┃ 👤 @${m.sender.split('@')[0]}
┃ 📊 Mensajes: ${user.spam.count}
┃ ⚡ Evita enviar tantos mensajes
╰━━━━━━━━━━━━⬣`,
          mentions: [m.sender]
        })
      }

      // 🚨 KICK
      if (user.spam.count >= 50) {

        await conn.sendMessage(m.chat, {
          text:
`╭━━〔 🚨 ANTI SPAM 〕━━⬣
┃ ❌ Usuario expulsado
┃ 👤 @${m.sender.split('@')[0]}
┃ 📊 Spam detectado: ${user.spam.count}
╰━━━━━━━━━━━━⬣`,
          mentions: [m.sender]
        })

        if (isBotAdmin) {
          await conn.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
          )
        }

        user.spam = { count: 0, time: now, warned: false }
      }

    } catch (e) {
      console.log(e)
    }

    return false
  }
}
