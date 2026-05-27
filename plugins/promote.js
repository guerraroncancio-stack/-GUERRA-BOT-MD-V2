const IMAGE_URL = "https://cdn.dix.lat/me/c58ae6d8-2932-4f99-bb9a-7527cbe9573b.jpg"

async function run(m, { conn, text }) {

  try {

    if (!m.isGroup) {
      return conn.sendMessage(m.chat, {
        image: { url: IMAGE_URL },
        caption: '❌ Este comando solo funciona en grupos'
      }, { quoted: m })
    }

    let user =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      null

    // =========================
    // 🔥 SI VIENE POR TEXTO
    // =========================
    if (!user && text) {

      const clean = text.replace(/[^0-9]/g, '')

      if (clean.length < 7) {
        return conn.sendMessage(m.chat, {
          image: { url: IMAGE_URL },
          caption: '❌ Número inválido'
        }, { quoted: m })
      }

      user = clean + '@s.whatsapp.net'
    }

    if (!user) {
      return conn.sendMessage(m.chat, {
        image: { url: IMAGE_URL },
        caption: '> ➤ Menciona o responde a un usuario para promoverlo 👑'
      }, { quoted: m })
    }

    // =========================
    // 🔍 VERIFICACIÓN WHATSAPP
    // =========================
    const [wa] = await conn.onWhatsApp(user)

    if (!wa?.exists) {
      return conn.sendMessage(m.chat, {
        image: { url: IMAGE_URL },
        caption: '❌ Este número no está registrado en WhatsApp'
      }, { quoted: m })
    }

    // =========================
    // 🔥 VALIDACIÓN EN GRUPO
    // =========================
    const metadata = await conn.groupMetadata(m.chat)

    const exists = metadata.participants.some(p =>
      conn.decodeJid(p.id || p.jid || p.participant) === user
    )

    if (!exists) {
      return conn.sendMessage(m.chat, {
        image: { url: IMAGE_URL },
        caption: '❌ Ese usuario no está en el grupo'
      }, { quoted: m })
    }

    // =========================
    // 👑 PROMOTE REAL
    // =========================
    await conn.groupParticipantsUpdate(
      m.chat,
      [user],
      'promote'
    )

    return conn.sendMessage(m.chat, {
      image: { url: IMAGE_URL },
      caption: '👑 Usuario promovido a administrador correctamente'
    }, { quoted: m })

  } catch (e) {

    console.log(e)

    return conn.sendMessage(m.chat, {
      image: { url: IMAGE_URL },
      caption: '🚫 Error al promover usuario'
    }, { quoted: m })
  }
}

export default {
  name: 'promote',
  command: ['promote', 'admin'],
  tags: ['group'],
  group: true,
  admin: true,
  botAdmin: true,
  run
}
