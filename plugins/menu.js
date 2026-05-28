import { promises } from 'fs'
import { join } from 'path'
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
          name: '👑 GUERRA BOT',
          jpegThumbnail: thumb
        }
      },
      participant: '0@s.whatsapp.net'
    }

  } catch {
    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'GUERRA'
      },
      message: { conversation: '👑 GUERRA BOT' }
    }
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
┃ ⬡ ${usedPrefix}allmenu
┃ ⬡ ${usedPrefix}owner
┃ ⬡ ${usedPrefix}ping
╰════════════════⬣

╭═〔 📡 STATUS 〕═⬣
┃ ◈ Engine » Online
┃ ◈ Database » Connected
┃ ◈ Response » Fast
┃ ◈ Security » Stable
╰════════════════⬣

> ⚡ Powered By Kevin Guerra
> 🚀 GUERRA BOT MD - Ultimate Edition
`

  const fkontak = await makeFkontak()

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: 'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg'
      },
      caption: menu,
      contextInfo: {
        mentionedJid: [m.sender]
      }
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
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
