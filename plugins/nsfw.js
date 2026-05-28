export default {

  name: 'nsfw',

  alias: [
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

  command: [
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

  async run(m, { conn, command, args }) {

    try {

      // =========================
      // 🔥 DATABASE FIX
      // =========================

      global.db.data = global.db.data || {}
      global.db.data.chats = global.db.data.chats || {}

      if (!global.db.data.chats[m.chat]) {

        global.db.data.chats[m.chat] = {
          nsfw: false
        }

      }

      const chat = global.db.data.chats[m.chat]

      // =========================
      // 🔞 ON / OFF
      // =========================

      if (
        command === 'nsfw'
      ) {

        const option =
        (args[0] || '').toLowerCase()

        if (!option) {

          return conn.sendMessage(
            m.chat,
            {
              text:
`╭━━〔 🔞 NSFW SYSTEM 🔞 〕━━⬣
┃
┃ Estado:
┃ ➥ ${chat.nsfw ? 'Activado ✅' : 'Desactivado ❌'}
┃
┃ Ejemplos:
┃ ➥ .nsfw on
┃ ➥ .nsfw off
┃
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            { quoted: m }
          )

        }

        if (option === 'on') {

          chat.nsfw = true

          return conn.sendMessage(
            m.chat,
            {
              text:
`╭━━〔 🔞 NSFW SYSTEM 🔞 〕━━⬣
┃
┃ NSFW activado ✅
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
`╭━━〔 🔞 NSFW SYSTEM 🔞 〕━━⬣
┃
┃ NSFW desactivado ❌
┃
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            { quoted: m }
          )

        }

      }

      // =========================
      // 🔒 CHECK NSFW
      // =========================

      if (!chat.nsfw && m.isGroup) {

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🔞 NSFW SYSTEM 🔞 〕━━⬣
┃
┃ Los comandos NSFW
┃ están desactivados.
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

          if (!global.pack.length)
          return m.reply('❌ No hay links en global.pack')

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

          if (!global.packgirl.length)
          return m.reply('❌ No hay links en global.packgirl')

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

          if (!global.packmen.length)
          return m.reply('❌ No hay links en global.packmen')

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

          if (!global.videosxxxc.length)
          return m.reply('❌ No hay links en global.videosxxxc')

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

          if (!global.videosxxxc2.length)
          return m.reply('❌ No hay links en global.videosxxxc2')

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
          text: `❌ Error:\n${e}`
        },
        { quoted: m }
      )

    }

  }

}

// =========================================
// 📦 LINKS
// PEGA TUS LINKS AQUÍ
// =========================================

global.pack = [

  // 'https://....jpg'

]

global.packgirl = [

  // 'https://....jpg'

]

global.packmen = [

  // 'https://....jpg'

]

global.videosxxxc = [

 'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
  'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
  'https://telegra.ph/file/f753759342337c4012b3f.mp4',
  'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
  'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
  'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
  'https://telegra.ph/file/1e316b25c787f94a0f8fd.mp4',
  'https://telegra.ph/file/c229d33edce798cde0ca4.mp4',
  'https://telegra.ph/file/b44223e72dd7e80e415f2.mp4',
  'https://telegra.ph/file/61486d45a8a3ea95a7c86.mp4',
  'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
  'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',
  'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
  'https://telegra.ph/file/598857924f3a29ffd37ae.mp4',
  'https://telegra.ph/file/528caef6ea950ec45aeef.mp4',
  'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
  'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
  'https://telegra.ph/file/f753759342337c4012b3f.mp4',
  'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
  'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
  'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
  'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',

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

]
