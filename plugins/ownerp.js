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
💼 Desarrollo de bots personalizados
⚙️ Configuración de sistemas WhatsApp MD
🚀 Automatización / optimización de bots
🤝 Soporte técnico y colaboraciones
━━━━━━━━━━━━━━

📩 Contacto directo:
wa.me/${OWNER_NUMBER}

⚡ Respuesta rápida y atención personalizada
🔒 Servicio privado y seguro
`

  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Owner GUERRA BOT
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}
END:VCARD
`.trim()

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
  command: ['owner', 'creador', 'contacto', 'dev'],
  group: false,
  admin: false,
  run
}
