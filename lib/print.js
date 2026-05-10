// lib/print.js

import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import fs, { watchFile } from 'fs'

const terminalImage =
  global.opts['img']
    ? (await import('terminal-image')).default
    : null

const urlRegex =
  (await import('url-regex-safe'))
    .default({ strict: false })

/* =========================================
   🌌 GUERRA BOT - PRINT SYSTEM
========================================= */

export default async function (
  m,
  conn = { user: {} }
) {

  try {

    if (!m) return
    if (m.sender === conn.user?.jid) return

    const botNumber = PhoneNumber(
      '+' +
      conn.user?.jid
        ?.replace(
          /[^0-9]/g,
          ''
        )
    ).getNumber('international')

    const senderNumber = PhoneNumber(
      '+' +
      m.sender.replace(
        /[^0-9]/g,
        ''
      )
    ).getNumber('international')

    const senderName =
      await conn.getName(m.sender)

    const chatName =
      await conn.getName(m.chat)

    const now =
      new Date()

    const hora =
      now.toLocaleString(
        'es-CO',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      )

    const fecha =
      now.toLocaleDateString(
        'es-CO'
      )

    const filesize =
      (
        m.msg?.fileLength?.low ||
        m.msg?.fileLength ||
        m.text?.length ||
        0
      )

    const tipoMensaje =
      m.mtype
        ? m.mtype
          .replace(/message$/gi, '')
          .replace(
            'audio',
            m.msg?.ptt
              ? 'PTT'
              : 'Audio'
          )
          .replace(
            /^./,
            v => v.toUpperCase()
          )
        : 'Desconocido'

    /* =========================
       IMAGEN TERMINAL
    ========================== */

    let img = null

    try {

      if (
        global.opts['img'] &&
        /sticker|image/gi.test(m.mtype)
      ) {

        const media =
          await m.download()

        img =
          await terminalImage.buffer(
            media,
            {
              width: '30%',
              height: '30%'
            }
          )
      }

    } catch (e) {
      console.error(e)
    }

    /* =========================
       HEADER
    ========================== */

    console.log(
      chalk.hex('#00f7ff')(
        '╭━━━━━━━━━━━━━━━━━━━━━━⬣'
      ) + '\n' +

      chalk.hex('#00f7ff')(
        '┃ 🤖 𝙂𝙐𝙀𝙍𝙍𝘼 𝘽𝙊𝙏 - SYSTEM'
      ) + '\n' +

      chalk.hex('#00f7ff')(
        '┣━━━━━━━━━━━━━━━━━━━━━━⬣'
      ) + '\n' +

      chalk.white('┃ ⏰ Hora: ') +
      chalk.cyanBright(hora) + '\n' +

      chalk.white('┃ 📅 Fecha: ') +
      chalk.greenBright(fecha) + '\n' +

      chalk.white('┃ 🤖 Bot: ') +
      chalk.yellowBright(botNumber) + '\n' +

      chalk.white('┃ 👤 Usuario: ') +
      chalk.magentaBright(
        senderNumber
      ) + '\n' +

      chalk.white('┃ 🪪 Nombre: ') +
      chalk.whiteBright(
        senderName || 'Desconocido'
      ) + '\n' +

      chalk.white('┃ 💬 Chat: ') +
      chalk.blueBright(
        m.isGroup
          ? `Grupo - ${chatName}`
          : `Privado - ${chatName}`
      ) + '\n' +

      chalk.white('┃ 📦 Tipo: ') +
      chalk.redBright(tipoMensaje) + '\n' +

      chalk.white('┃ 📏 Peso: ') +
      chalk.gray(
        `${filesize} bytes`
      ) + '\n' +

      chalk.white('┃ 🧩 Plugin: ') +
      chalk.greenBright(
        m.plugin || 'Ninguno'
      ) + '\n' +

      chalk.white('┃ ⚡ Comando: ') +
      chalk.cyanBright(
        m.isCommand
          ? 'Sí'
          : 'No'
      ) + '\n' +

      chalk.hex('#00f7ff')(
        '╰━━━━━━━━━━━━━━━━━━━━━━⬣'
      )
    )

    /* =========================
       PREVIEW MEDIA
    ========================== */

    if (img)
      console.log(
        img.trimEnd()
      )

    /* =========================
       MENSAJE
    ========================== */

    if (
      typeof m.text === 'string' &&
      m.text
    ) {

      let text =
        m.text.replace(
          /\u200e+/g,
          ''
        )

      if (text.length < 4096) {

        text =
          text.replace(
            urlRegex,
            url =>
              chalk.blueBright(url)
          )
      }

      if (m.mentionedJid) {

        for (const user of m.mentionedJid) {

          text =
            text.replace(
              '@' +
              user.split('@')[0],

              chalk.cyanBright(
                '@' +
                await conn.getName(user)
              )
            )
        }
      }

      console.log(

        chalk.gray(
          '╭─〔 MENSAJE 〕─⬣\n'
        ) +

        (
          m.isCommand
            ? chalk.yellowBright(text)
            : m.error
              ? chalk.redBright(text)
              : chalk.white(text)
        ) +

        '\n' +

        chalk.gray(
          '╰────────────────⬣\n'
        )
      )
    }

    /* =========================
       DOCUMENTOS
    ========================== */

    if (/document/i.test(m.mtype)) {

      console.log(

        chalk.greenBright(
          `📄 Documento: ${
            m.msg?.fileName ||
            m.msg?.displayName ||
            'Archivo'
          }`
        )
      )
    }

    /* =========================
       AUDIO
    ========================== */

    if (/audio/i.test(m.mtype)) {

      const duration =
        m.msg?.seconds || 0

      console.log(

        chalk.cyanBright(

          `🎧 Audio (${Math.floor(duration / 60)
            .toString()
            .padStart(2, '0')}:${(duration % 60)
              .toString()
              .padStart(2, '0')})`
        )
      )
    }

    /* =========================
       VIDEO
    ========================== */

    if (/video/i.test(m.mtype)) {

      console.log(

        chalk.magentaBright(
          `🎥 Video recibido`
        )
      )
    }

    /* =========================
       STICKER
    ========================== */

    if (/sticker/i.test(m.mtype)) {

      console.log(

        chalk.yellowBright(
          `🧩 Sticker detectado`
        )
      )
    }

    console.log()

  } catch (e) {

    console.error(
      '❌ Error en print.js:',
      e
    )
  }
}

/* =========================================
   HOT RELOAD
========================================= */

let file =
  global.__filename(
    import.meta.url
  )

watchFile(file, () => {

  console.log(

    chalk.redBright(
      '♻️ Se actualizó lib/print.js'
    )
  )
})
