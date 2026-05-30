const activos = {

  name: 'activos',
  alias: ['top', 'topactivos'],
  description: 'Ranking de usuarios más activos',

  async before(m) {

    try {

      if (!m.isGroup) return
      if (!m.sender) return

      global.db ||= {}
      global.db.data ||= {}
      global.db.data.users ||= {}

      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
      }

      const user =
      global.db.data.users[m.sender]

      if (!user.activity) {

        user.activity = {
          total: 0,
          week: 0,
          month: 0
        }

      }

      user.activity.total++
      user.activity.week++
      user.activity.month++

    } catch (e) {

      console.log('[ ACTIVITY TRACKER ]')
      console.log(e)

    }

    return false

  },

  async run(m, { conn }) {

    try {

      if (!m.isGroup)
      return m.reply('❌ Solo funciona en grupos')

      const metadata =
      await conn.groupMetadata(m.chat)

      const members =
      metadata.participants.map(v => v.id)

      const ranking =
      members
      .map(jid => {

        const user =
        global.db?.data?.users?.[jid]

        return [
          jid,
          user?.activity?.total || 0
        ]

      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

      if (!ranking.length)
      return m.reply('⚠️ No hay actividad registrada.')

      const totalMessages =
      ranking.reduce(
        (a, b) => a + b[1],
        0
      )

      let text =
`╭━━〔 🏆 TOP ACTIVOS 🏆 〕━━⬣
┃
┃ 📊 Ranking de actividad
┃
`

      const mentions = []

      for (let i = 0; i < ranking.length; i++) {

        const [jid, total] =
        ranking[i]

        mentions.push(jid)

        let medal = '🏅'

        if (i === 0) medal = '🥇'
        else if (i === 1) medal = '🥈'
        else if (i === 2) medal = '🥉'

        const percent =
        totalMessages
        ? ((total / totalMessages) * 100).toFixed(1)
        : 0

        text +=
`┃ ${medal} ${i + 1}. @${jid.split('@')[0]}
┃ 💬 ${total} mensajes
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

      console.log('[ TOP ACTIVOS ]')
      console.log(e)

    }

  }

}

export default activos
