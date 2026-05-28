export default {

  async all(m, { conn, isOwner }) {

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
      // 🚫 CHECK
      // =========================

      if (
        !global.db.data.settings.antiprivado
      ) return

      if (m.isGroup) return

      if (isOwner) return

      // =========================
      // ⚠️ WARNING
      // =========================

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚫 ACCESO DENEGADO 🚫 〕━━⬣
┃
┃ No puedes usar el bot
┃ por privado.
┃
┃ Serás bloqueado automáticamente.
┃
┃ Contacta al owner si
┃ necesitas acceso.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

      // =========================
      // ⛔ BLOCK
      // =========================

      await conn.updateBlockStatus(
        m.sender,
        'block'
      )

    } catch (e) {

      console.log(e)

    }

  }

}
