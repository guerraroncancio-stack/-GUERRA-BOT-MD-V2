const OWNER_NUMBER = '573102286030'
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`

let cachedPP = 'https://api.dix.lat/media2/1777604199636.jpg'

// 🔥 precarga en segundo plano (NO bloquea el comando)
async function refreshPP(conn) {
  try {
    const url = await conn.profilePictureUrl(OWNER_JID, 'image')
    if (url) cachedPP = url
  } catch {}
}

// 🔥 actualiza cada 5 minutos sin frenar el bot
setInterval(() => {
  refreshPP(global.conn).catch(() => {})
}, 5 * 60 * 1000)

async function run(m, { conn }) {

  // 🔥 intenta refrescar sin bloquear respuesta
  refreshPP(conn).catch(() => {})

  const text = `
👑 *CONTACTO OFICIAL DEL OWNER*

📩 WhatsApp directo:
wa.me/${OWNER_NUMBER}

⚡ Soporte / compras / configuración de bot
`

  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Owner del Bot
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}
END:VCARD
`.trim()

  // 🔥 RESPUESTA INMEDIATA (sin await de foto)
  await conn.sendMessage(m.chat, {
    image: { url: cachedPP },
    caption: text,
    contacts: {
      displayName: '👑 Owner GUERRA BOT',
      contacts: [{ vcard }]
    }
  }, { quoted: m })
}

export default {
  name: 'owner',
  command: ['owner', 'creador', 'contacto'],
  group: false,
  admin: false,
  run
}
