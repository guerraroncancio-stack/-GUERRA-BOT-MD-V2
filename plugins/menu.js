import fetch from 'node-fetch'

async function makeThumb() {
  const res = await fetch(
    'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg'
  )
  return Buffer.from(await res.arrayBuffer())
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
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━〔 🌌 MENU 〕━━⬣
┃ ⬡ ${usedPrefix}menu
┃ ⬡ ${usedPrefix}owner
┃ ⬡ ${usedPrefix}ping
╰━━━━━━━━━━━━━━━━━━━━⬣

> ⚡ GUERRA BOT MD
`

  const thumb = await makeThumb()

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
          body: 'Sistema activo',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://cdn.dix.lat'
        }
      }
    },
    { quoted: m }
  )
}

export default { command: ['menu'], run }

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
