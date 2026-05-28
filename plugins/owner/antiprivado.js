export default {

  async all(m, { conn, isOwner }) {

    try {

      // =========================
      // 👑 OWNER BYPASS
      // =========================

      if (isOwner) return

      // =========================
      // 👥 IGNORAR GRUPOS
      // =========================

      if (m.isGroup) return

      // =========================
      // 🤖 IGNORAR BOTS
      // =========================

      if (m.fromMe) return

      // =========================
      // ⚠️ MENSAJE
      // =========================

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚫 ACCESO DENEGADO 🚫 〕━━⬣
┃
┃ Solo el owner puede
┃ escribirle al bot
┃ por privado.
┃
┃ Serás bloqueado.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

      // =========================
      // ⏳ ESPERA
      // =========================

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      )

      // =========================
      // ❌ ELIMINAR CONTACTO
      // =========================

      if (conn.contacts?.[m.sender]) {

        delete conn.contacts[m.sender]

      }

      // =========================
      // ⛔ BLOQUEAR
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
