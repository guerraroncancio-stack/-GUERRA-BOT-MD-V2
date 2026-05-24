const mutedUsers = new Set()

async function run(m, { conn, command, isAdmin, isBotAdmin }) {

  try {

    if (!m.isGroup) return

    if (!isBotAdmin) {
      return conn.reply(
        m.chat,
        '👑 El bot necesita ser administrador.',
        m
      )
    }

    if (!isAdmin) {
      return conn.reply(
        m.chat,
        '👑 Solo los administradores pueden usar este comando.',
        m
      )
    }

    let user = null

    if (m.quoted?.sender) {
      user = m.quoted.sender
    } else if (m.mentionedJid?.length) {
      user = m.mentionedJid[0]
    }

    if (!user) {
      return conn.reply(
        m.chat,
        '👑 Responde o menciona al usuario que quieres mutear.',
        m
      )
    }

    if (command === 'mute') {

      mutedUsers.add(user)

      return conn.reply(
        m.chat,
        `✅ *Usuario muteado:* @${user.split('@')[0]}`,
        m,
        { mentions: [user] }
      )
    }

    if (command === 'unmute') {

      mutedUsers.delete(user)

      return conn.reply(
        m.chat,
        `✅ *Usuario desmuteado:* @${user.split('@')[0]}`,
        m,
        { mentions: [user] }
      )
    }

  } catch (e) {

    console.log(e)

    return conn.reply(
      m.chat,
      '❌ Error al ejecutar el comando',
      m
    )
  }
}

/**
 * 🔥 Bloqueo global (antes de procesar mensajes)
 * Esto es lo correcto en tu arquitectura MD si NO usas handler.before
 */
async function before(m, { conn }) {

  try {

    if (!m.isGroup) return

    if (!mutedUsers.has(m.sender)) return

    // No borrar stickers (como tenías)
    if (m.mtype === 'stickerMessage') return

    await conn.sendMessage(
      m.chat,
      { delete: m.key }
    )

  } catch (e) {
    console.log(e)
  }
}

export default {

  name: 'mute',
  aliases: ['unmute'],
  tags: ['group'],
  command: ['mute', 'unmute'],

  group: true,
  admin: true,
  botAdmin: true,

  run,
  before
}
