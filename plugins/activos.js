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

      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {}
      }

      const chat =
      global.db.data.chats[m.chat]

      chat.activity ||= {}

      if (!chat.activity[m.sender]) {
        chat.activity[m.sender] = {
          total: 0,
          week: 0,
          month: 0
        }
      }

      chat.activity[m.sender].total++
      chat.activity[m.sender].week++
      chat.activity[m.sender].month++

    } catch (e) {

      console.log(
        '[ ACTIVITY TRACKER ]'
      )

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
      .sort(
        (a, b) =>
        b[1].total -
        a[1].total
      )
      .slice(0, 10)

      if (!ranking.length) {

        return m.reply(
          '⚠️ No hay usuarios registrados.'
        )

      }

      const totalMessages =
      ranking.reduce(
        (a, b) =>
        a + b[1].total,
        0
      )

      let text =
`╭━━〔 🏆 TOP ACTIVOS 🏆 〕━━⬣
┃
┃ 📊 Ranking del grupo
┃
`

      let mentions = []

      for (
        let i = 0;
        i < ranking.length;
        i++
      ) {

        const [
          jid,
          data
        ] = ranking[i]

        mentions.push(jid)

        const percent =
        totalMessages
        ? (
          data.total /
          totalMessages *
          100
        ).toFixed(1)
        : 0

        let medal = '🏅'

        if (i === 0)
        medal = '🥇'

        else if (i === 1)
        medal = '🥈'

        else if (i === 2)
        medal = '🥉'

        text +=
`┃ ${medal} ${i + 1}. @${jid.split('@')[0]}
┃ 💬 ${data.total} mensajes
┃ 📈 ${percent}% actividad
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

      console.log(
        '[ TOP ACTIVOS ]'
      )

      console.log(e)

    }

  }

}

export default activos
