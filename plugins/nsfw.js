export default {

  name: 'nsfw',

  command: [
    'nsfw',
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
  ],

  tags: ['nsfw'],

  async run(m, { conn, command, args, isAdmin, isOwner }) {

    try {

      // =========================
      // 🔥 FIX DATABASE
      // =========================

      global.db = global.db || {}
      global.db.data = global.db.data || {}
      global.db.data.chats = global.db.data.chats || {}

      if (!global.db.data.chats[m.chat]) {

        global.db.data.chats[m.chat] = {
          nsfw: false
        }

      }

      const chat =
      global.db.data.chats[m.chat]

      // =========================
      // 🔞 ACTIVAR / DESACTIVAR
      // =========================

      if (command === 'nsfw') {

        if (!m.isGroup) {
          return m.reply('❌ Solo para grupos.')
        }

        if (!isAdmin && !isOwner) {
          return m.reply('❌ Solo admins.')
        }

        const option =
        (args[0] || '').toLowerCase()

        if (option === 'on') {

          chat.nsfw = true

          return conn.sendMessage(
            m.chat,
            {
              text:
`╭━━〔 🔞 NSFW 🔞 〕━━⬣
┃
┃ Estado:
┃ ➥ ACTIVADO ✅
┃
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            { quoted: m }
          )

        }

        if (option === 'off') {

          chat.nsfw = false

          return conn.sendMessage(
            m.chat,
            {
              text:
`╭━━〔 🔞 NSFW 🔞 〕━━⬣
┃
┃ Estado:
┃ ➥ DESACTIVADO ❌
┃
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            { quoted: m }
          )

        }

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🔞 NSFW SYSTEM 🔞 〕━━⬣
┃
┃ Uso correcto:
┃ ➥ .nsfw on
┃ ➥ .nsfw off
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // 🔞 CHECK NSFW
      // =========================

      if (!chat.nsfw && m.isGroup) {

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🔞 NSFW 🔞 〕━━⬣
┃
┃ El sistema NSFW
┃ está desactivado.
┃
┃ Usa:
┃ ➥ .nsfw on
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // 🥵 PACK
      // =========================

      switch (command) {

        case 'pack': {

          const url =
          global.pack[
            Math.floor(Math.random() * global.pack.length)
          ]

          await conn.sendMessage(
            m.chat,
            {
              image: { url },
              caption: '🥵 Pack 🥵'
            },
            { quoted: m }
          )

        }
        break

        // =========================
        // 🥵 PACK 2
        // =========================

        case 'pack2': {

          const url =
          global.packgirl[
            Math.floor(Math.random() * global.packgirl.length)
          ]

          await conn.sendMessage(
            m.chat,
            {
              image: { url },
              caption: '🥵 Pack 2 🥵'
            },
            { quoted: m }
          )

        }
        break

        // =========================
        // 🥵 PACK 3
        // =========================

        case 'pack3': {

          const url =
          global.packmen[
            Math.floor(Math.random() * global.packmen.length)
          ]

          await conn.sendMessage(
            m.chat,
            {
              image: { url },
              caption: '🥵 Pack 3 🥵'
            },
            { quoted: m }
          )

        }
        break

        // =========================
        // 🎥 VIDEO XXX
        // =========================

        case 'videoxxx':
        case 'vídeoxxx': {

          const url =
          global.videosxxxc[
            Math.floor(Math.random() * global.videosxxxc.length)
          ]

          await conn.sendMessage(
            m.chat,
            {
              video: { url },
              caption: '🥵 VIDEO XXX 🥵',
              gifPlayback: false
            },
            { quoted: m }
          )

        }
        break

        // =========================
        // 🎥 VIDEO LESBI
        // =========================

        case 'videoxxxlesbi':
        case 'videolesbixxx':
        case 'pornolesbivid':
        case 'pornolesbianavid':
        case 'pornolesbiv':
        case 'pornolesbianav':
        case 'pornolesv': {

          const url =
          global.videosxxxc2[
            Math.floor(Math.random() * global.videosxxxc2.length)
          ]

          await conn.sendMessage(
            m.chat,
            {
              video: { url },
              caption: '🥵 VIDEO LESBI 🥵',
              gifPlayback: false
            },
            { quoted: m }
          )

        }
        break

      }

    } catch (e) {

      console.log(e)

      return conn.sendMessage(
        m.chat,
        {
          text: '❌ Error al ejecutar el comando.'
        },
        { quoted: m }
      )

    }

  }

}

// =========================================
// 📦 LINKS
// =========================================

global.pack = [
  // "LINK.jpg"
]

global.packgirl = [
  // "LINK.jpg"
]

global.packmen = [
  // "LINK.jpg"
]

global.videosxxxc = [
  // "LINK.mp4"
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
