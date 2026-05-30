const activos = {

  name: 'activos',
  alias: ['top', 'topactivos'],
  description: 'Ranking de usuarios más activos',

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

      if (global.db.write) {
        await global.db.write()
      }

    } catch (e) {

      console.log('[ ACTIVITY TRACKER ]')
      console.log(e)

    }

  },

  async run(m, { conn }) {

    try {

      if (!m.isGroup)
      return m.reply('❌ Solo funciona en grupos')

      const chat =
      global.db?.data?.chats?.[m.chat]

      if (
        !chat ||
        !chat.activity
      ) {

        return m.reply(
          '⚠️ Aún no existen registros de actividad.'
        )

      }

      const ranking =
      Object.entries(chat.activity)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)

      if (!ranking.length) {

        return m.reply(
          '⚠️ No hay usuarios registrados.'
        )

      }

      let totalMensajes = 0

      for (const [, data] of ranking) {
        totalMensajes += data.total
      }

      let text =
`╭━━〔 🏆 TOP ACTIVOS 🏆 〕━━⬣
┃
┃ 📊 Usuarios más activos
┃
`

      const mentions = []

      for (let i = 0; i < ranking.length; i++) {

        const [jid, data] = ranking[i]

        mentions.push(jid)

        let medal = '🏅'

        if (i === 0) medal = '🥇'
        else if (i === 1) medal = '🥈'
        else if (i === 2) medal = '🥉'

        const porcentaje =
        totalMensajes > 0
        ? ((data.total * 100) / totalMensajes).toFixed(1)
        : 0

        text +=
`┃ ${medal} ${i + 1}. @${jid.split('@')[0]}
┃ 💬 ${data.total} mensajes
┃ 📈 ${porcentaje}% actividad
┃
`

      }

      text +=
`╰━━━━━━━━━━━━━━━━━━⬣`

      await conn.sendMessage(
        m.chat,
        {
          text,
          mentions
        },
        { quoted: m }
      )

    } catch (e) {

      console.log('[ TOP ACTIVOS ]')
      console.log(e)

    }

  }

}

export default activos
