//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🌐 CONFIGURACIÓN GLOBAL - GUERRA BOT
// 👑 Powered By Guerra
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 👑 OWNER & STAFF
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.owner = [
  ['34016526909591', 'GUERRA OFC', true],
  ['123884707811532', 'Ayudante', true]
]

global.mods = []
global.prems = []

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🤖 INFORMACIÓN DEL BOT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.namebot = 'GUERRA BOT 👑'
global.botname = 'GUERRA BOT 👑'
global.packname = 'GUERRA BOT 👑'
global.author = '© Powered By GUERRA BOT 👑'

global.vs = '3.0.0'
global.libreria = 'Baileys'
global.baileys = '6.7.16'
global.language = 'es'
global.region = 'CO'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// ✨ EMOJIS & ESTILO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.emoji = '👑'
global.emoji2 = '⚡'
global.moneda = 'MayCoins'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📸 IMÁGENES OFICIALES
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.banner = 'https://api.dix.lat/media2/1777604199636.jpg'

global.menuimg = 'https://api.dix.lat/media2/1777604199636.jpg'
global.thumbnail = 'https://api.dix.lat/media2/1778159078063.jpg'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// ⚙️ PREFIJOS Y SESIONES
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.usedPrefix = '#'
global.prefix = ['#', '.', '/', '!']

global.sessions = 'GuerraBot'
global.jadi = 'GuerraSubBots'
global.yukiJadibts = true

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🔥 CONFIGURACIONES RPG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.multiplier = 69
global.maxwarn = 3
global.user2 = '18'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🌐 CANAL OFICIAL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.namecanal = '⌈ 👑 ⌋ GUERRA BOT • CHANNEL OFICIAL'

global.idcanal = '120363427020147321@newsletter'
global.idcanal2 = '120363427020147321@newsletter'

global.canal = 'https://whatsapp.com/channel/0029Vb7ldkaKGGGMdqKACP0y'
global.canalreg = '120363427020147321@newsletter'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 📢 AUTO JOIN CHANNELS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.ch = {
  ch1: '120363427020147321@newsletter'
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🎭 MENSAJES CONTEXTUALES
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363427020147321@newsletter',
      serverMessageId: 143,
      newsletterName: 'GUERRA BOT • CHANNEL 👑'
    },

    externalAdReply: {
      title: 'GUERRA BOT 👑',
      body: 'Bot Premium de WhatsApp',
      mediaType: 1,
      previewType: 'PHOTO',
      renderLargerThumbnail: true,
      showAdAttribution: false,
      thumbnailUrl: 'https://api.dix.lat/media2/1778159078063.jpg',
      sourceUrl: 'https://whatsapp.com/channel/0029Vb7ldkaKGGGMdqKACP0y'
    }
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🛡️ APIs
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.APIs = {
  guerra: 'https://api.dix.lat'
}

global.APIKeys = {
  'https://api.dix.lat': 'GuerraBot'
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// ⚡ RESPUESTAS RÁPIDAS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.wait = '⏳ Procesando solicitud...'
global.eror = '❌ Ocurrió un error inesperado.'
global.done = '✅ Acción completada correctamente.'
global.adminOnly = '⚠️ Este comando es solo para administradores.'
global.ownerOnly = '👑 Este comando es exclusivo del owner.'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🧠 CONFIGURACIONES EXTRA
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

global.opts = {
  self: false,
  autoread: false,
  antiCall: true,
  antiPrivate: false,
  restrict: true
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 🔄 AUTO RELOAD CONFIG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

let file = fileURLToPath(import.meta.url)

watchFile(file, () => {
  unwatchFile(file)

  console.log(
    chalk.bold.greenBright(
      "♻️ Se actualizó correctamente 'config.js'"
    )
  )

  import(`${file}?update=${Date.now()}`)
})

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
// 👑 FIN DEL ARCHIVO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
