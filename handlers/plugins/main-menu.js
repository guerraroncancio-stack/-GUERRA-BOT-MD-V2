import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

async function makeFkontak() {
  try {
    const res = await fetch('https://api.dix.lat/media2/1777431468205.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'GUERRA'
      },
      message: {
        locationMessage: {
          name: '👑 GUERRA BOT MULTI MENU',
          jpegThumbnail: thumb2
        }
      },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    if (global.db?.data == null) await global.loadDatabase?.()

    try {
      await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })
    } catch {}

    let _package = {}
    try {
      _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')))
    } catch {
      _package = { version: '1.0.0' }
    }

    let name = m.pushName || 'Usuario'
    try {
      const resolvedName = await Promise.resolve(conn.getName ? conn.getName(m.sender) : null)
      if (resolvedName) name = resolvedName
    } catch {}

    let totalreg = Object.keys(global.db?.data?.users || {}).length
    let uptime = clockString(process.uptime() * 1000)

    let menuText = `
╭━〔 👑 GUERRA BOT 👑 〕━━━⬣
┃ ✦ Usuario: ${name}
┃ ✦ Usuarios: ${totalreg}
┃ ✦ Versión: ${_package.version}
┃ ✦ Uptime: ${uptime}
╰━━━━━━━━━━━━⬣

╭━━〔 🎮 GAMES 〕━━━⬣
┃ ✦ ${_p}2vs2
┃ ✦ ${_p}4vs4
┃ ✦ ${_p}6vs6
┃ ✦ ${_p}12vs12
┃ ✦ ${_p}16vs16
┃ ✦ ${_p}20vs20
┃ ✦ ${_p}24vs24
╰━━━━━━━━━━━━⬣

╭━━〔 📥 DESCARGAS 〕━━━⬣
┃ ✦ ${_p}play
╰━━━━━━━━━━━━⬣

╭━━〔 🖼️ STICKERS 〕━━━⬣
┃ ✦ ${_p}sticker
┃ ✦ ${_p}wm
┃ ✦ ${_p}qc
┃ ✦ ${_p}toimg
┃ ✦ ${_p}brat
┃ ✦ ${_p}pfp
┃ ✦ ${_p}scat
┃ ✦ ${_p}googleimg
┃ ✦ ${_p}hd
┃ ✦ ${_p}iqc
╰━━━━━━━━━━━━⬣

╭━━〔 🛠️ GROUP CONTROL 〕━━⬣
┃ ✦ ${_p}open
┃ ✦ ${_p}close
┃ ✦ ${_p}kick
┃ ✦ ${_p}tagall
┃ ✦ ${_p}promote
┃ ✦ ${_p}demote
┃ ✦ ${_p}link
┃ ✦ ${_p}mute
┃ ✦ ${_p}unmute
┃ ✦ ${_p}setname
┃ ✦ ${_p}horario
┃ ✦ ${_p}resetlink
┃ ✦ ${_p}encuesta
┃ ✦ ${_p}fantasmas
┃ ✦ ${_p}setbye
┃ ✦ ${_p}setwelcome
┃ ✦ ${_p}ping
╰━━━━━━━━━━━━⬣

╭━━〔 ⚙️ BOT STATUS 〕━━⬣
┃ ✦ ${_p}on
┃ ✦ ${_p}off
┃ ✦ ${_p}antiprivado
┃ ✦ ${_p}antilink
┃ ✦ ${_p}welcome
┃ ✦ ${_p}modoadmin
╰━━━━━━━━━━━━⬣

╭━━〔 👑 OWNER GUERRA 〕━━⬣
┃ ✦ ${_p}panel
┃ ✦ ${_p}restart
┃ ✦ ${_p}mode
┃ ✦ ${_p}banuser
┃ ✦ ${_p}autoadmin
┃ ✦ ${_p}join
┃ ✦ ${_p}update
┃ ✦ ${_p}setnamebot
┃ ✦ ${_p}lid
╰━━━━━━━━━━━━⬣

╭━━〔 🎭 DIVERSIÓN 〕━━⬣
┃ ✦ ${_p}gay
┃ ✦ ${_p}formarpareja
┃ ✦ ${_p}adoptado
┃ ✦ ${_p}adoptada
┃ ✦ ${_p}alienigena
┃ ✦ ${_p}aliens
┃ ✦ ${_p}follar
┃ ✦ ${_p}penetrar
┃ ✦ ${_p}pack
┃ ✦ ${_p}videoxxx
┃ ✦ ${_p}amigorandom
┃ ✦ ${_p}asustar
┃ ✦ ${_p}carrera
┃ ✦ ${_p}chistes
┃ ✦ ${_p}consejo
┃ ✦ ${_p}doxeo
┃ ✦ ${_p}facto
┃ ✦ ${_p}formartrios
┃ ✦ ${_p}gordopantene
┃ ✦ ${_p}gordoteton
┃ ✦ ${_p}kiss
┃ ✦ ${_p}love
┃ ✦ ${_p}mamaguevo
┃ ✦ ${_p}oracion
┃ ✦ ${_p}paja
┃ ✦ ${_p}piropos
┃ ✦ ${_p}meme
┃ ✦ ${_p}coger
╰━━━━━━━━━━━━⬣
`

    let imageUrl = 'https://api.dix.lat/media2/1777431468205.jpg'
    let fkontak = await makeFkontak()

    try {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption: menuText
        },
        { quoted: fkontak }
      )
    } catch {
      await conn.sendMessage(
        m.chat,
        { text: menuText },
        { quoted: fkontak }
      )
    }

  } catch (e) {
    console.log(e)
    m.reply(`❌ Error en GUERRA BOT MENU\n${e?.message || e}`)
  }
}

handler.command = ['menu']
handler.tags = ['main']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
