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

  tags: ['nsfw'],

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

  async run(m, { conn, command }) {

    try {

      // =========================
      // 🔥 FIX DATABASE
      // =========================

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
      // 🔞 CHECK NSFW
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
┃ ➥ .enable nsfw
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
            Math.floor(
              Math.random() *
              global.pack.length
            )
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
            Math.floor(
              Math.random() *
              global.packgirl.length
            )
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
            Math.floor(
              Math.random() *
              global.packmen.length
            )
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
            Math.floor(
              Math.random() *
              global.videosxxxc.length
            )
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
            Math.floor(
              Math.random() *
              global.videosxxxc2.length
            )
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
// PEGA TUS LINKS AQUÍ
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

  // "LINK.mp4"

]
