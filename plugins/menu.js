import fetch from 'node-fetch'

async function makeFkontak() {
  return {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'GUERRA'
    },
    message: {
      conversation: '👑 GUERRA BOT'
    },
    participant: '0@s.whatsapp.net'
  }
}

async function run(m, { conn, usedPrefix }) {

  const name = m.pushName || 'Usuario'
  const uptime = clockString(process.uptime() * 1000)

  const menu = `
╭═〔 ⚔️ GUERRA BOT MD ⚔️ 〕═⬣
┃ ◈ Usuario » ${name}
┃ ◈ Tiempo » ${uptime}
┃ ◈ Prefijo » ${usedPrefix}
┃ ◈ Modo » Public
╰════════════════⬣

╭═〔 🌌 CORE 〕═⬣
┃ ⬡ ${usedPrefix}menu
┃ ⬡ ${usedPrefix}owner
┃ ⬡ ${usedPrefix}ping
╰════════════════⬣

╭═〔 📡 STATUS 〕═⬣
┃ ◈ Engine » Online
┃ ◈ Database » Connected
┃ ◈ Response » Fast
╰════════════════⬣

> ⚡ GUERRA BOT MD
`

  const fkontak = await makeFkontak()

  // =========================
  // ⚔️ MENÚ + ANIMACIÓN + FOTO (TODO EN UNO)
  // =========================
  await conn.sendMessage(
    m.chat,
    {
      video: {
        url: 'https://cdn.dix.lat/me/b267_a8edfc35-d71b-47a0-a1ef-58e28aec4312.mp4'
      },

      gifPlayback: true,

      caption: menu,

      contextInfo: {
        externalAdReply: {
          title: '⚔️ GUERRA BOT MD',
          body: 'Sistema activo - Ultimate Edition',
          thumbnailUrl: 'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: fkontak }
  )
}

export default {
  name: 'menu',
  aliases: ['help'],
  tags: ['main'],
  command: ['menu'],
  run
}

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
