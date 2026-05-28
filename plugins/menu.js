import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

async function makeFkontak() {

  try {

    const res =
    await fetch(
      'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg'
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
╭━━━〔 👑 GUERRA BOT MD 👑 〕━━⬣
┃ 👤 Usuario » ${name}
┃ ⏱️ Uptime » ${uptime}
┃ ⚡ Prefix » ${usedPrefix}
┃ 🌐 Mode » Public
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 🧠 IA SYSTEM 〕━━⬣
┃ ⬡ ${usedPrefix}gpt
┃ ⬡ ${usedPrefix}flux
┃ ⬡ ${usedPrefix}codeai
┃ ⬡ ${usedPrefix}vision
┃ ⬡ ${usedPrefix}imagine
┃ ⬡ ${usedPrefix}voiceai
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 📥 DOWNLOAD 〕━━⬣
┃ ⬡ ${usedPrefix}play
┃ ⬡ ${usedPrefix}ytmp3
┃ ⬡ ${usedPrefix}ytmp4
┃ ⬡ ${usedPrefix}pinterest
┃ ⬡ ${usedPrefix}mega
┃ ⬡ ${usedPrefix}apkmod
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 🛠️ TOOLS 〕━━⬣
┃ ⬡ ${usedPrefix}hd
┃ ⬡ ${usedPrefix}tourl
┃ ⬡ ${usedPrefix}readqr
┃ ⬡ ${usedPrefix}tinyurl
┃ ⬡ ${usedPrefix}traducir
┃ ⬡ ${usedPrefix}clima
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 👑 GROUP 〕━━⬣
┃ ⬡ ${usedPrefix}kick
┃ ⬡ ${usedPrefix}ban
┃ ⬡ ${usedPrefix}promote
┃ ⬡ ${usedPrefix}demote
┃ ⬡ ${usedPrefix}hidetag
┃ ⬡ ${usedPrefix}grupo
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 🎮 FUN 〕━━⬣
┃ ⬡ ${usedPrefix}ship
┃ ⬡ ${usedPrefix}fakechat
┃ ⬡ ${usedPrefix}duelo
┃ ⬡ ${usedPrefix}amistad
┃ ⬡ ${usedPrefix}crush
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 ⚙️ OWNER 〕━━⬣
┃ ⬡ ${usedPrefix}restart
┃ ⬡ ${usedPrefix}plugins
┃ ⬡ ${usedPrefix}broadcast
┃ ⬡ ${usedPrefix}mode
┃ ⬡ ${usedPrefix}update
╰━━━━━━━━━━━━━━━━⬣

╭━━〔 📡 STATUS 〕━━⬣
┃ 🚀 Speed » Fast
┃ 🧠 AI » Online
┃ 💾 DB » Connected
┃ 🔒 Security » Stable
╰━━━━━━━━━━━━━━━━⬣

> 👑 Powered By Kevin Guerra
> ⚔️ GUERRA BOT MD
`

  const fkontak =
  await makeFkontak()

  // =========================================
  // 🎥 VIDEO MENU CON FOTO + GIF STYLE
  // =========================================

  await conn.sendMessage(
    m.chat,
    {
      video: {
        url: 'https://cdn.dix.lat/me/9ead583f-ba4b-41ac-bd3f-f3567c2471b5.mp4'
      },

      gifPlayback: true,

      jpegThumbnail: await (
        await fetch(
          'https://api.dix.lat/media2/1777431468205.jpg'
        )
      ).buffer(),

      caption: menu,

      mimetype: 'video/mp4'
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
  .map(v =>
    v.toString().padStart(2, '0')
  )
  .join(':')

}
