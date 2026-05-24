const OWNER_NUMBER = '573001234567'
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`

// 🔥 CACHE en memoria
let cachedPP = null
let lastFetch = 0

async function getOwnerPP(conn) {
  const now = Date.now()

  // cache válido por 10 minutos
  if (cachedPP && now - lastFetch < 10 * 60 * 1000) {
    return cachedPP
  }

  try {
    const url = await conn.profilePictureUrl(OWNER_JID, 'image')
    cachedPP = url
    lastFetch = now
    return url
  } catch {
    cachedPP = 'https://api.dix.lat/media2/1777604199636.jpg'
    lastFetch = now
    return cachedPP
  }
}

async function run(m, { conn }) {

  const pp = await getOwnerPP(conn)

  const text = `
👑 *CONTACTO OFICIAL DEL OWNER*

📩 Compra / soporte / configuración / bots personalizados

⚡ Respuesta rápida
`

  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Owner del Bot
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}
END:VCARD
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
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
