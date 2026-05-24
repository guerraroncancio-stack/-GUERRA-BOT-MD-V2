import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

async function makeFkontak() {
  try {

    const res =
    await fetch(
      'https://cdn.dix.lat/me/1777431468205.jpg'
    )

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
╰━━━━━━━━━━━━⬣

╭━━〔 📥 COMANDOS 〕━━⬣
┃ ✦ ${usedPrefix}menu
┃ ✦ ${usedPrefix}play
┃ ✦ ${usedPrefix}sticker
┃ ✦ ${usedPrefix}kick
┃ ✦ ${usedPrefix}open
┃ ✦ ${usedPrefix}close
┃ ✦ ${usedPrefix}tagall
┃ ✦ ${usedPrefix}ping
╰━━━━━━━━━━━━⬣
`

  const fkontak =
  await makeFkontak()

  await conn.sendMessage(
    m.chat,
    {
      image: {
        url: 'https://cdn.dix.lat/me/1777431468205.jpg'
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
