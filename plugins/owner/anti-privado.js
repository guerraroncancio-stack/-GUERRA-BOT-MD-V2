export async function before(m, { conn, isOwner, isROwner }) {

  try {

    // =========================
    // IGNORAR
    // =========================

    if (!m.message) return false
    if (m.isGroup) return false
    if (m.fromMe) return false
    if (m.key?.fromMe) return false
    if (m.chat === 'status@broadcast') return false

    // =========================
    // OWNER CHECK
    // =========================

    if (isOwner || isROwner) return false

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
    // ESPERA
    // =========================

    await new Promise(resolve =>
      setTimeout(resolve, 1500)
    )

    // =========================
    // BLOQUEAR
    // =========================

    await conn.updateBlockStatus(
      m.sender,
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

    console.log(
      '[ ANTI PRIVADO ERROR ]',
      e
    )

  }

  return false

}
