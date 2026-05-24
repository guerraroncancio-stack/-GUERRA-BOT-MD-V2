async function run(m, { conn }) {

  const OWNER_NUMBER = '573102286030' // 🔥 tu número con código país

  let pp
  try {
    pp = await conn.profilePictureUrl(`${OWNER_NUMBER}@s.whatsapp.net`, 'image')
  } catch {
    pp = 'https://api.dix.lat/media2/1777604199636.jpg' // fallback si no hay foto
  }

  const text = `
👑 *CONTACTO OFICIAL DEL OWNER*

📩 Puedes escribirme directamente para:
• Compras del bot
• Soporte técnico
• Configuraciones personalizadas
• Colaboraciones

⚡ Respuesta rápida garantizada
`

  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Owner del Bot
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}
END:VCARD
`.trim()

  // 🔥 envía la foto del owner como imagen principal
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
  command: ['owner', 'creador', 'dueño', 'contacto'],
  group: false,
  admin: false,
  run
}
