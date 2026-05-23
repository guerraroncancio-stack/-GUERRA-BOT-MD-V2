import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

async function makeFkontak() {

  try {

    const res = await fetch(
      'https://api.dix.lat/media2/1777431468205.jpg'
    )

    const thumb2 =
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
          name: '👑 GUERRA BOT MENU',
          jpegThumbnail: thumb2
        }
      },

      participant: '0@s.whatsapp.net'

    }

  } catch {

    return undefined

  }

}

async function run(m, { conn, usedPrefix }) {

  try {

    let packageData = {}

    try {

      packageData = JSON.parse(
        await promises.readFile(
          join(process.cwd(), 'package.json')
        )
      )

    } catch {

      packageData = {
        version: '1.0.0'
      }

    }

    const uptime =
    clockString(process.uptime() * 1000)

    const menuText = `
╭━〔 👑 GUERRA BOT 👑 〕━━━⬣
┃ ✦ Usuario: ${m.pushName || 'Usuario'}
┃ ✦ Version: ${packageData.version}
┃ ✦ Runtime: ${uptime}
╰━━━━━━━━━━━━⬣

╭━━〔 📌 MAIN 〕━━⬣
┃ ✦ ${usedPrefix}menu
┃ ✦ ${usedPrefix}ping
┃ ✦ ${usedPrefix}play
┃ ✦ ${usedPrefix}sticker
╰━━━━━━━━━━━━⬣
`

    const fkontak =
    await makeFkontak()

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url:
          'https://api.dix.lat/media2/1777431468205.jpg'
        },
        caption: menuText
      },
      {
        quoted: fkontak
      }
    )

  } catch (err) {

    console.log(err)

    await conn.sendMessage(
      m.chat,
      {
        text:
        `❌ Error:\n${err.message}`
      }
    )

  }

}

export default {

  name: 'menu',

  aliases: ['help'],

  tags: ['main'],

  description: 'Menu principal',

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
  .map(v =>
    v.toString().padStart(2, '0')
  )
  .join(':')

}
