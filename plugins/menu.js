import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

async function makeFkontak() {
  try {

    const res =
    await fetch('https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg')

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
╭═〔 ⚔️ GUERRA BOT MD ⚔️ 〕═⬣
┃ ◈ Usuario » ${name}
┃ ◈ Tiempo » ${uptime}
┃ ◈ Prefijo » ${usedPrefix}
┃ ◈ Modo » Public
╰════════════════⬣

╭═〔 🌌 CORE 〕═⬣
┃ ⬡ ${usedPrefix}menu
┃ ⬡ ${usedPrefix}allmenu
┃ ⬡ ${usedPrefix}runtime
┃ ⬡ ${usedPrefix}owner
┃ ⬡ ${usedPrefix}script
┃ ⬡ ${usedPrefix}ping
┃ ⬡ ${usedPrefix}dashboard
╰════════════════⬣

╭═〔 🎭 COMMUNITY 〕═⬣
┃ ⬡ ${usedPrefix}confesar
┃ ⬡ ${usedPrefix}ship
┃ ⬡ ${usedPrefix}duelo
┃ ⬡ ${usedPrefix}fakechat
┃ ⬡ ${usedPrefix}topglobal
┃ ⬡ ${usedPrefix}amistad
┃ ⬡ ${usedPrefix}crush
╰════════════════⬣

╭═〔 📦 MEDIA 〕═⬣
┃ ⬡ ${usedPrefix}play
┃ ⬡ ${usedPrefix}ytmp3
┃ ⬡ ${usedPrefix}ytmp4
┃ ⬡ ${usedPrefix}apkmod
┃ ⬡ ${usedPrefix}pinterest
┃ ⬡ ${usedPrefix}ttimg
┃ ⬡ ${usedPrefix}mega
╰════════════════⬣

╭═〔 🧠 INTELIGENCIA IA 〕═⬣
┃ ⬡ ${usedPrefix}gpt
┃ ⬡ ${usedPrefix}flux
┃ ⬡ ${usedPrefix}bard
┃ ⬡ ${usedPrefix}imagine
┃ ⬡ ${usedPrefix}vision
┃ ⬡ ${usedPrefix}voiceai
┃ ⬡ ${usedPrefix}codeai
╰════════════════⬣

╭═〔 ⚒️ UTILIDADES 〕═⬣
┃ ⬡ ${usedPrefix}hd
┃ ⬡ ${usedPrefix}remini
┃ ⬡ ${usedPrefix}tourl
┃ ⬡ ${usedPrefix}readqr
┃ ⬡ ${usedPrefix}clima
┃ ⬡ ${usedPrefix}traducir
┃ ⬡ ${usedPrefix}tinyurl
╰════════════════⬣

╭═〔 👑 ADMIN PANEL 〕═⬣
┃ ⬡ ${usedPrefix}kick
┃ ⬡ ${usedPrefix}ban
┃ ⬡ ${usedPrefix}promote
┃ ⬡ ${usedPrefix}demote
┃ ⬡ ${usedPrefix}grupo abrir
┃ ⬡ ${usedPrefix}grupo cerrar
┃ ⬡ ${usedPrefix}invocar
╰════════════════⬣

╭═〔 🎮 GAMING 〕═⬣
┃ ⬡ ${usedPrefix}ffstats
┃ ⬡ ${usedPrefix}scrim
┃ ⬡ ${usedPrefix}vs
┃ ⬡ ${usedPrefix}topfire
┃ ⬡ ${usedPrefix}registrarclan
┃ ⬡ ${usedPrefix}mapas
┃ ⬡ ${usedPrefix}rangos
╰════════════════⬣

╭═〔 💎 ECONOMY 〕═⬣
┃ ⬡ ${usedPrefix}wallet
┃ ⬡ ${usedPrefix}bank
┃ ⬡ ${usedPrefix}crime
┃ ⬡ ${usedPrefix}work
┃ ⬡ ${usedPrefix}coins
┃ ⬡ ${usedPrefix}daily
┃ ⬡ ${usedPrefix}transfer
╰════════════════⬣

╭═〔 🛰️ OWNER SYSTEM 〕═⬣
┃ ⬡ ${usedPrefix}restart
┃ ⬡ ${usedPrefix}setppbot
┃ ⬡ ${usedPrefix}mode
┃ ⬡ ${usedPrefix}broadcast
┃ ⬡ ${usedPrefix}cleartmp
┃ ⬡ ${usedPrefix}plugins
┃ ⬡ ${usedPrefix}update
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
  const fkontak =
await conn.sendMessage(
  m.chat,
  {
    video: {
      url: 'https://cdn.dix.lat/me/b267_a8edfc35-d71b-47a0-a1ef-58e28aec4312.mp4'
    },

    gifPlayback: true,

    contextInfo: {
      externalAdReply: {
        title: '⚔️ GUERRA BOT MD',
        body: 'Sistema activo - Ultimate Edition',
        thumbnailUrl: 'https://cdn.dix.lat/me/bb174465-aa94-4844-8b89-ff4bc5f77f17.jpg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }
)
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
