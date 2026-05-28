const handler = async (m, { conn, command }) => {

  // =========================
  // 🔥 FIX DATABASE
  // =========================

  global.db.data = global.db.data || {}
  global.db.data.chats = global.db.data.chats || {}

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  if (!('nsfw' in global.db.data.chats[m.chat])) {
    global.db.data.chats[m.chat].nsfw = false
  }

  // =========================
  // 🔞 NSFW CHECK
  // =========================

  if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
    throw '🚩 *¡Los comandos NSFW están desactivados!*'
  }

  try {

    switch (command) {

      // =========================
      // 🥵 PACK
      // =========================

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

// =========================================
// 📦 LINKS DE IMÁGENES Y VIDEOS
// PEGA TUS LINKS ABAJO
// =========================================

global.pack = [
  // LINKS PACK
]

global.packgirl = [
  // LINKS PACK GIRL
]

global.packmen = [
  // LINKS PACK MEN
]

global.videosxxxc = [
  // LINKS VIDEOS XXX
]

global.videosxxxc2 = [
  // LINKS VIDEOS LESBI
]
