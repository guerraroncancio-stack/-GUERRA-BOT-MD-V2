import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

async function makeFkontak() {
  try {

    const res =
    await fetch('https://cdn.dix.lat/me/0e8b184d-c3d0-491e-a56e-98f06d6907e9.jpg')

    const thumb =
    Buffer.from(await res.arrayBuffer())

    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'GUERRA'
      },

      message: {
        locationMessage: {
          name: '👑 GUERRA BOT',
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

  const name =
  m.pushName || 'Usuario'

  const uptime =
  clockString(process.uptime() * 1000)

const menu = `
╭━━〔 👑 GUERRA BOT 👑 〕━━⬣
┃ ✦ Usuario: ${name}
┃ ✦ Uptime: ${uptime}
┃ ✦ Prefijo: ${usedPrefix}
╰━━━━━━━━━━━━⬣

╭━━〔 📥 MAIN 〕━━⬣
┃ ✦ ${usedPrefix}menu
┃ ✦ ${usedPrefix}code
┃ ✦ ${usedPrefix}stop
┃ ✦ ${usedPrefix}bots
┃ ✦ ${usedPrefix}report / bug
┃ ✦ ${usedPrefix}sugerencia
┃ ✦ ${usedPrefix}topcmd
╰━━━━━━━━━━━━⬣

╭━━〔 🎮 FUN 〕━━⬣
┃ ✦ ${usedPrefix}gay
┃ ✦ ${usedPrefix}top
┃ ✦ ${usedPrefix}parejas
┃ ✦ ${usedPrefix}poema
┃ ✦ ${usedPrefix}reflexion
┃ ✦ ${usedPrefix}meme
┃ ✦ ${usedPrefix}consejo
╰━━━━━━━━━━━━⬣

╭━━〔 👥 SOCIAL 〕━━⬣
┃ ✦ ${usedPrefix}perfil
┃ ✦ ${usedPrefix}setdesc
┃ ✦ ${usedPrefix}setage
┃ ✦ ${usedPrefix}setgenero
┃ ✦ ${usedPrefix}setorientacion
┃ ✦ ${usedPrefix}marry
╰━━━━━━━━━━━━⬣

╭━━〔 📥 DOWNLOAD 〕━━⬣
┃ ✦ ${usedPrefix}play
┃ ✦ ${usedPrefix}play2
┃ ✦ ${usedPrefix}spotify
┃ ✦ ${usedPrefix}tiktok
┃ ✦ ${usedPrefix}instagram
┃ ✦ ${usedPrefix}mediafire
╰━━━━━━━━━━━━⬣

╭━━〔 💰 RPG 〕━━⬣
┃ ✦ ${usedPrefix}balance
┃ ✦ ${usedPrefix}ruleta
┃ ✦ ${usedPrefix}loteria
┃ ✦ ${usedPrefix}pay
┃ ✦ ${usedPrefix}robar
┃ ✦ ${usedPrefix}trabajar
╰━━━━━━━━━━━━⬣

╭━━〔 👑 GROUP 〕━━⬣
┃ ✦ ${usedPrefix}kick
┃ ✦ ${usedPrefix}promote
┃ ✦ ${usedPrefix}demote
┃ ✦ ${usedPrefix}tagall
┃ ✦ ${usedPrefix}open
┃ ✦ ${usedPrefix}close
┃ ✦ ${usedPrefix}hidetag
╰━━━━━━━━━━━━⬣

╭━━〔 🤖 AI 〕━━⬣
┃ ✦ ${usedPrefix}ia
┃ ✦ ${usedPrefix}chatgpt
┃ ✦ ${usedPrefix}gemini
┃ ✦ ${usedPrefix}copilot
┃ ✦ ${usedPrefix}imgg
┃ ✦ ${usedPrefix}tts
╰━━━━━━━━━━━━⬣

╭━━〔 ⚙️ TOOLS 〕━━⬣
┃ ✦ ${usedPrefix}qr
┃ ✦ ${usedPrefix}tourl
┃ ✦ ${usedPrefix}traducir
┃ ✦ ${usedPrefix}acortar
┃ ✦ ${usedPrefix}ssweb
╰━━━━━━━━━━━━⬣

╭━━〔 🔥 OWNER 〕━━⬣
┃ ✦ ${usedPrefix}restart
┃ ✦ ${usedPrefix}up
┃ ✦ ${usedPrefix}autoadmin
┃ ✦ ${usedPrefix}ds
╰━━━━━━━━━━━━⬣

╭━━〔 📊 ESTADO 〕━━⬣
┃ ✦ Bot activo 100%
┃ ✦ Sistema estable
┃ ✦ Latencia OK
╰━━━━━━━━━━━━⬣
`

  const fkontak =
  await makeFkontak()

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: ' https://cdn.dix.lat/me/0e8b184d-c3d0-491e-a56e-98f06d6907e9.jpg'
      },

      caption: menu
    },
    {
      quoted: fkontak
    }
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

  const h =
  Math.floor(ms / 3600000)

  const m =
  Math.floor(ms / 60000) % 60

  const s =
  Math.floor(ms / 1000) % 60

  return [h, m, s]
  .map(v => v.toString().padStart(2, '0'))
  .join(':')

}
