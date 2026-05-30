const modAdmin = {

  name: 'modoadmin_system',
  alias: ['modoadmin'],
  description: 'Sistema modoadmin + activity tracker',

  // =========================
  // 📊 BEFORE SYSTEM
  // =========================
  async before(m) {

    try {

      if (!m.isGroup) return

      global.db ||= {}
      global.db.data ||= {}
      global.db.data.chats ||= {}

      const chatId = m.chat

      if (!global.db.data.chats[chatId]) {
        global.db.data.chats[chatId] = {}
      }

      const chat = global.db.data.chats[chatId]

      // =========================
      // 📊 ACTIVITY SYSTEM
      // =========================
      if (!chat.activity) {
        chat.activity = {}
      }

      const userId = m.sender

      if (!chat.activity[userId]) {
        chat.activity[userId] = {
          total: 0,
          lastMessage: Date.now()
        }
      }

      chat.activity[userId].total += 1
      chat.activity[userId].lastMessage = Date.now()

      // =========================
      // 🛡 MOD ADMIN SYSTEM
      // =========================
      if (chat.modoadmin === true) {

        const isOwner = global.owner?.includes?.(userId)
        const isAdmin = m.isAdmin
        const isROwner = m.isROwner
        const isBotAdmin = m.isBotAdmin

        if (isBotAdmin && !isOwner && !isAdmin && !isROwner) {

          const prefix = global.prefix || '.'
          const text = m.text || ''

          if (text.startsWith(prefix)) {
            return false // bloquea comandos del bot
          }
        }
      }

      if (global.db.write) {
        await global.db.write()
      }

    } catch (e) {
      console.log('[ MODADMIN BEFORE ERROR ]', e)
    }
  },

  // =========================
  // ⚙️ COMMAND: .modoadmin on/off
  // =========================
  async run(m, { conn, text }) {

    try {

      if (!m.isGroup)
        return m.reply('❌ Solo funciona en grupos')

      global.db ||= {}
      global.db.data ||= {}
      global.db.data.chats ||= {}

      const chat = global.db.data.chats[m.chat]

      if (!chat.modoadmin) chat.modoadmin = false

      const cmd = (text || '').toLowerCase().trim()

      // =========================
      // 📌 ON
      // =========================
      if (cmd === 'on') {

        chat.modoadmin = true

        return m.reply(
`🛡 MOD ADMIN ACTIVADO

🔒 Solo admins pueden usar comandos del bot
📊 Activity tracking activo`
        )
      }

      // =========================
      // 📌 OFF
      // =========================
      if (cmd === 'off') {

        chat.modoadmin = false

        return m.reply(
`🛡 MOD ADMIN DESACTIVADO

🔓 Todos los usuarios pueden usar comandos`
        )
      }

      // =========================
      // 📌 STATUS
      // =========================
      return m.reply(
`╭─〔 🛡 MOD ADMIN 〕─⬣
│
│ Estado: ${chat.modoadmin ? '🟢 ON' : '🔴 OFF'}
│
│ Uso:
│ .modoadmin on
│ .modoadmin off
│
╰──────────────⬣`
      )

    } catch (e) {
      console.log('[ MODADMIN COMMAND ERROR ]', e)
    }
  }
}

export default modAdmin
