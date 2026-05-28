export default {

  name: 'anti-privado',

  async all(m, { conn }) {

    try {

      // =========================
      // IGNORAR MENSAJES
      // =========================

      if (!m.chat) return
      if (m.isGroup) return
      if (m.fromMe) return
      if (m.key?.fromMe) return

      // =========================
      // OWNER
      // =========================

      const owners = global.owner || []

      const sender =
      (m.sender || '')
      .replace(/[^0-9]/g, '')

      const isOwner =
      owners.some(v =>
        sender === String(v[0])
      )

      if (isOwner) return

      // =========================
      // MENSAJE
      // =========================

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚫 ACCESO DENEGADO 🚫 〕━━⬣
┃
┃ ❌ No puedes escribir
┃ al privado del bot.
┃
┃ 👑 Solo el owner
┃ tiene acceso.
┃
┃ 🚷 Serás bloqueado.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

      // =========================
      // BLOQUEAR
      // =========================

      await conn.updateBlockStatus(
        m.chat,
        'block'
      )

      // =========================
      // ELIMINAR CHAT
      // =========================

      if (conn.chatModify) {

        await conn.chatModify(
          {
            delete: true,
            lastMessages: []
          },
          m.chat
        ).catch(() => {})

      }

    } catch (e) {

      console.log(e)

    }

  }

}
