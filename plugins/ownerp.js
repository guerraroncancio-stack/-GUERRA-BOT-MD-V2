const OWNER_NUMBER = '573102286030'
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`

let cachedPP = 'https://api.dix.lat/media2/1777604199636.jpg'

async function refreshPP(conn) {
  try {
    const url = await conn.profilePictureUrl(OWNER_JID, 'image')
    if (url) cachedPP = url
  } catch {}
}

setInterval(() => {
  refreshPP(global.conn).catch(() => {})
}, 5 * 60 * 1000)

async function run(m, { conn }) {

  refreshPP(conn).catch(() => {})

  const text = `
👑 𝗢𝗙𝗜𝗖𝗜𝗔𝗟 𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗡𝗧𝗔𝗖𝗧

━━━━━━━━━━━━━━
💼 Bots personalizados WhatsApp MD
⚙️ Configuración y soporte técnico
🚀 Automatización avanzada
🤝 Colaboraciones privadas
━━━━━━━━━━━━━━

📩 wa.me/${OWNER_NUMBER}

⚡ Respuesta rápida y atención directa
🔒 Servicio seguro y privado
`

  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Owner GUERRA BOT
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}
END:VCARD
`.trim()

  // 🔥 1. Primero manda imagen con texto (ESTO asegura que se vea)
  await conn.sendMessage(m.chat, {
    image: { url: cachedPP },
    caption: text
  }, { quoted: m })

  // 🔥 2. Luego manda contacto separado (más compatible)
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: '👑 Owner GUERRA BOT',
      contacts: [{ vcard }]
    }
  }, { quoted: m })
}

export default {
  name: 'owner',
  command: ['owner', 'creador', 'contacto', 'dev'],
  group: false,
  admin: false,
  run
}
