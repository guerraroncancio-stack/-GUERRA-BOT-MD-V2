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

      // 🔥 FIX CRÍTICO: evitar null/undefined
      global.db.data.chats[m.chat] ||= {}

      const chat = global.db.data.chats[m.chat]

      // =========================
      // 📊 ACTIVITY SYSTEM
      // =========================
      chat.activity ||= {}

      const userId = m.sender

      chat.activity[userId] ||= {
        total: 0,
        lastMessage: Date.now()
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

        // solo afecta comandos si el bot es admin
        if (isBotAdmin && !isOwner && !isAdmin && !isROwner) {

          const prefix = global.prefix || '.'
          const text = m.text || ''

          if (text.startsWith(prefix)) {
            return false
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
  // ⚙️ COMMAND
  // =========================
async run(m, { conn, text }) {

    try {

        if (!m.isGroup)
            return m.reply('❌ Solo funciona en grupos')

        global.db ||= {}
        global.db.data ||= {}
        global.db.data.chats ||= {}

        // 🔥 FIX CRÍTICO
        global.db.data.chats[m.chat] ||= {}

        const chat = global.db.data.chats[m.chat]

        chat.modoadmin ||= false

        const cmd = (text || '').toLowerCase().trim()

        if (cmd === 'on') {

            chat.modoadmin = true

            return m.reply(
`╭─〔 🛡 MOD ADMIN 〕─⬣
│
│ 🟢 ACTIVADO
│
╰──────────────⬣`
            )
        }

        if (cmd === 'off') {

            chat.modoadmin = false

            return m.reply(
`╭─〔 🛡 MOD ADMIN 〕─⬣
│
│ 🔴 DESACTIVADO
│
╰──────────────⬣`
            )
        }

        return m.reply(
`╭─〔 🛡 MOD ADMIN 〕─⬣
│ Estado: ${chat.modoadmin ? 'ON 🟢' : 'OFF 🔴'}
╰──────────────⬣`
        )

    } catch (e) {
        console.log('[ MODADMIN ERROR ]', e)
    }
}

      // =========================
      // 📌 STATUS
      // =========================
      return m.reply(
`╭─〔 🛡 MOD ADMIN STATUS 〕─⬣
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
