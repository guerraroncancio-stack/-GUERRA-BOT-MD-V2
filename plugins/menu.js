import fetch from 'node-fetch'

async function makeFkontak() {
  try {
    const res = await fetch(
      'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg'
    )

    const thumb = Buffer.from(await res.arrayBuffer())

    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'GUERRA'
      },
      message: {
        locationMessage: {
          name: '👑 GUERRA BOT MD',
          jpegThumbnail: thumb
        }
      },
      participant: '0@s.whatsapp.net'
    }

  } catch {
    return undefined
  }
}

async function run(m, { conn, usedPrefix }) {

  const name = m.pushName || 'Usuario'
  const uptime = clockString(process.uptime() * 1000)

  const menu = `
╭━━━━━━━━━━━━━━━━━━━━⬣
┃        ⚔️ GUERRA BOT MD ⚔️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━〔 👤 USER INFO 〕━━⬣
┃ ✦ Usuario: ${name}
┃ ✦ Runtime: ${uptime}
┃ ✦ Prefix: ${usedPrefix}
┃ ✦ Mode: Public
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━〔 🌌 CORE 〕━━⬣
┃ ⬡ ${usedPrefix}menu
┃ ⬡ ${usedPrefix}allmenu
┃ ⬡ ${usedPrefix}owner
┃ ⬡ ${usedPrefix}ping
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━〔 ⚡ GUERRA SYSTEM 〕━━⬣
┃ ✦ Estado: ONLINE
┃ ✦ Seguridad: STABLE
┃ ✦ Motor: OPTIMIZED
╰━━━━━━━━━━━━━━━━━━━━⬣

> ⚡ GUERRA BOT MD - Ultimate Edition
`

  const fkontak = await makeFkontak()

  // =========================
  // 🖼️ 1. IMAGEN DE ENTRADA
  // =========================
  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: 'https://cdn.dix.lat/me/b06e63d2-bc0b-4c85-9f7a-eef09fc64f64.jpg'
      },
      caption: `
⚔️ *GUERRA BOT MD* ⚔️
Iniciando sistema...
`
    },
    { quoted: fkontak }
  )

  // pequeño delay para efecto real de “animación”
  await new Promise(r => setTimeout(r, 1200))

  // =========================
  // 🎥 2. ANIMACIÓN / MENÚ
  // =========================
  await conn.sendMessage(
    m.chat,
    {
      video: {
        url: 'https://cdn.dix.lat/me/b267_a8edfc35-d71b-47a0-a1ef-58e28aec4312.mp4'
      },
      gifPlayback: true,
      caption: menu
    },
    { quoted: fkontak }
  )
}

export default {
  name: 'menu',
  aliases: ['help'],
  command: ['menu'],
  run
}

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
