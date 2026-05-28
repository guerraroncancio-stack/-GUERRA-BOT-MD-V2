export default {

  name: 'antiprivado',

  alias: [
    'antipv',
    'privado'
  ],

  tags: ['owner'],

  command: [
    'antiprivado',
    'antipv',
    'privado'
  ],

  rowner: true,

  async run(m, { conn, args }) {

    try {

      // =========================
      // 🔥 DATABASE FIX
      // =========================

      global.db.data = global.db.data || {}

      if (!global.db.data.settings) {
        global.db.data.settings = {}
      }

      if (!global.db.data.settings.antiprivado) {
        global.db.data.settings.antiprivado = false
      }

      // =========================
      // ⚙️ OPTION
      // =========================

      const option =
      (args[0] || '').toLowerCase()

      if (!option) {

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ Estado:
┃ ➥ ${
global.db.data.settings.antiprivado
? 'Activado ✅'
: 'Desactivado ❌'
}
┃
┃ Ejemplos:
┃ ➥ .antiprivado on
┃ ➥ .antiprivado off
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // ✅ ON
      // =========================

      if (option === 'on') {

        global.db.data.settings.antiprivado = true

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ Sistema activado ✅
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // ❌ OFF
      // =========================

      if (option === 'off') {

        global.db.data.settings.antiprivado = false

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ Sistema desactivado ❌
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

    } catch (e) {

      console.log(e)

      return m.reply(
        '❌ Error en anti privado'
      )

    }

  }

}
