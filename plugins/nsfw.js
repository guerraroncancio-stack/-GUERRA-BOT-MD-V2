import fetch from 'node-fetch';

const handler = async (m, { conn, command, usedPrefix }) => {

  // =========================
  // 🔥 FIX DATABASE
  // =========================

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  if (!('nsfw' in global.db.data.chats[m.chat])) {
    global.db.data.chats[m.chat].nsfw = false
  }

  // =========================
  // 🔞 NSFW ACTIVADO
  // =========================

  if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
    throw '🚩 *¡Estos comandos están desactivados!*'
  }

  switch (command) {

    case 'pack': {

      const url =
      pack[Math.floor(Math.random() * pack.length)]

      await conn.sendMessage(
        m.chat,
        {
          image: { url },
          caption: `*🥵 Pack 🥵*`
        },
        { quoted: m }
      )

    }
    break

    case 'pack2': {

      const url2 =
      packgirl[Math.floor(Math.random() * packgirl.length)]

      await conn.sendMessage(
        m.chat,
        {
          image: { url: url2 },
          caption: `*🥵 Pack 2 🥵*`
        },
        { quoted: m }
      )

    }
    break

    case 'pack3': {

      const url3 =
      packmen[Math.floor(Math.random() * packmen.length)]

      await conn.sendMessage(
        m.chat,
        {
          image: { url: url3 },
          caption: `*🥵 Pack 3 🥵*`
        },
        { quoted: m }
      )

    }
    break

    case 'videoxxx':
    case 'vídeoxxx': {

      const url4 =
      videosxxxc[Math.floor(Math.random() * videosxxxc.length)]

      await conn.sendMessage(
        m.chat,
        {
          video: { url: url4 },
          caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`,
          gifPlayback: false
        },
        { quoted: m }
      )

    }
    break

    case 'videoxxxlesbi':
    case 'videolesbixxx':
    case 'pornolesbivid':
    case 'pornolesbianavid':
    case 'pornolesbiv':
    case 'pornolesbianav':
    case 'pornolesv': {

      const url5 =
      videosxxxc2[Math.floor(Math.random() * videosxxxc2.length)]

      await conn.sendMessage(
        m.chat,
        {
          video: { url: url5 },
          caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`,
          gifPlayback: false
        },
        { quoted: m }
      )

    }
    break

  }

}

handler.help = [
  'pack',
  'pack2',
  'pack3',
  'videoxxx',
  'vídeoxxx',
  'videoxxxlesbi',
  'videolesbixxx',
  'pornolesbivid',
  'pornolesbianavid',
  'pornolesbiv',
  'pornolesbianav',
  'pornolesv'
]

handler.command = [
  'pack',
  'pack2',
  'pack3',
  'videoxxx',
  'vídeoxxx',
  'videoxxxlesbi',
  'videolesbixxx',
  'pornolesbivid',
  'pornolesbianavid',
  'pornolesbiv',
  'pornolesbianav',
  'pornolesv'
]

handler.tags = ['nsfw']

export default handler
global.pack = [
  'LINK1',
  'LINK2'
]

global.packgirl = [
  'LINK1',
  'LINK2'
]

global.packmen = [
  'LINK1',
  'LINK2'
]

global.videosxxxc = [
  'VIDEO1',
  'VIDEO2'
]

global.videosxxxc2 = [
"https://telegra.ph/file/2dfb1ad0cab22951e30d1.mp4",
"https://telegra.ph/file/c430651857023968d3a76.mp4",
"https://telegra.ph/file/1ba17f6230dd1ea2de48c.mp4",
"https://telegra.ph/file/e04b802f12aafee3d314e.mp4",
"https://telegra.ph/file/a58661697d519d3d0acbd.mp4",
"https://telegra.ph/file/9ed60b18e79fcfebcd76c.mp4",
"https://telegra.ph/file/d58096000ad5eaef0b05e.mp4",
"https://telegra.ph/file/60b4c8ebeadebb7e0da06.mp4"
];
