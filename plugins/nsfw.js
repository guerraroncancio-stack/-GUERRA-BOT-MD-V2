export default {

  name: 'nsfw',

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

  async run(m, { conn, command }) {

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
      // 🔞 NSFW CHECK
      // =========================

      if (m.isGroup && !chat.nsfw) {

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 🚫 NSFW DESACTIVADO 🚫 〕━━⬣
┃
┃ Los comandos NSFW
┃ están desactivados
┃ en este grupo.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // 🥵 PACK
      // =========================

      if (command === 'pack') {

        if (!global.pack?.length) {
          return m.reply('❌ No hay imágenes configuradas.')
        }

        const url =
        global.pack[
          Math.floor(Math.random() * global.pack.length)
        ]

        return conn.sendMessage(
          m.chat,
          {
            image: { url },
            caption: '🥵 Pack 🥵'
          },
          { quoted: m }
        )

      }

      // =========================
      // 🥵 PACK 2
      // =========================

      if (command === 'pack2') {

        if (!global.packgirl?.length) {
          return m.reply('❌ No hay imágenes configuradas.')
        }

        const url =
        global.packgirl[
          Math.floor(Math.random() * global.packgirl.length)
        ]

        return conn.sendMessage(
          m.chat,
          {
            image: { url },
            caption: '🥵 Pack 2 🥵'
          },
          { quoted: m }
        )

      }

      // =========================
      // 🥵 PACK 3
      // =========================

      if (command === 'pack3') {

        if (!global.packmen?.length) {
          return m.reply('❌ No hay imágenes configuradas.')
        }

        const url =
        global.packmen[
          Math.floor(Math.random() * global.packmen.length)
        ]

        return conn.sendMessage(
          m.chat,
          {
            image: { url },
            caption: '🥵 Pack 3 🥵'
          },
          { quoted: m }
        )

      }

      // =========================
      // 🎥 VIDEO XXX
      // =========================

      if (
        command === 'videoxxx' ||
        command === 'vídeoxxx'
      ) {

        if (!global.videosxxxc?.length) {
          return m.reply('❌ No hay videos configurados.')
        }

        const url =
        global.videosxxxc[
          Math.floor(Math.random() * global.videosxxxc.length)
        ]

        return conn.sendMessage(
          m.chat,
          {
            video: { url },
            caption: '🥵 VIDEO XXX 🥵',
            gifPlayback: false
          },
          { quoted: m }
        )

      }

      // =========================
      // 🎥 VIDEO LESBI
      // =========================

      if (
        [
          'videoxxxlesbi',
          'videolesbixxx',
          'pornolesbivid',
          'pornolesbianavid',
          'pornolesbiv',
          'pornolesbianav',
          'pornolesv'
        ].includes(command)
      ) {

        if (!global.videosxxxc2?.length) {
          return m.reply('❌ No hay videos configurados.')
        }

        const url =
        global.videosxxxc2[
          Math.floor(Math.random() * global.videosxxxc2.length)
        ]

        return conn.sendMessage(
          m.chat,
          {
            video: { url },
            caption: '🥵 VIDEO LESBI 🥵',
            gifPlayback: false
          },
          { quoted: m }
        )

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
// 📦 PEGA TUS LINKS AQUÍ
// =========================================

global.pack = [

  // 'LINK1',
  // 'LINK2'

]

global.packgirl = [

  // 'LINK1',
  // 'LINK2'

]

global.packmen = [

  // 'LINK1',
  // 'LINK2'

]

global.videosxxxc = [

  // 'VIDEO1.mp4',
  // 'VIDEO2.mp4'

]

global.videosxxxc2 = [

  // 'VIDEO1.mp4',
  // 'VIDEO2.mp4'

]
