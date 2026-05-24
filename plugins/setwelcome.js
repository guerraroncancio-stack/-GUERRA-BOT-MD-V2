export async function run(m, { conn, text, command }) {
  m.react?.('🙌🏻')

  // =========================
  // CONTEXTO SEGURO
  // =========================
  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:GUERRA BOT
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Bot
END:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  // =========================
  // DB SAFE INIT
  // =========================
  global.db = global.db || {}
  global.db.data = global.db.data || {}
  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  const cmd = (command || '').toLowerCase()

  const isSet = cmd === 'setwelcome' || cmd === 'bienvenida'
  const isDel = cmd === 'delwelcome'

  // =========================
  // SET WELCOME
  // =========================
  if (isSet) {
    if (!text || !text.trim()) {
      return conn.reply(m.chat, '❗ Escribe el mensaje de bienvenida', m)
    }

    global.db.data.chats[m.chat].sWelcome = text.trim()

    return conn.reply(
      m.chat,
      '✅ Bienvenida configurada correctamente',
      fkontak
    )
  }

  // =========================
  // DELETE WELCOME
  // =========================
  if (isDel) {
    if (!global.db.data.chats[m.chat].sWelcome) {
      return conn.reply(m.chat, '❌ No hay bienvenida configurada', m)
    }

    delete global.db.data.chats[m.chat].sWelcome

    return conn.reply(
      m.chat,
      '✅ Bienvenida eliminada correctamente',
      fkontak
    )
  }

  // =========================
  // HELP
  // =========================
  return conn.reply(
    m.chat,
`╭━━〔 👑 GUERRA BOT 👑 〕━━⬣
┃ ✦ Configuración de bienvenida
╰━━━━━━━━━━━━⬣

📌 Comandos:
• .setwelcome texto
• .bienvenida texto
• .delwelcome

📌 Variables:
• @user → usuario
• @group → grupo
• @desc → descripción`,
    m
  )
}
