import path from 'path'
import chalk from 'chalk'
import pino from 'pino'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'
import { format } from 'util'
import { fileURLToPath } from 'url'

import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  extractMessageContent,
  makeInMemoryStore,
  Browsers,
  proto
} from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const logger = pino({ level: 'silent' })

const store = makeInMemoryStore({
  logger
})

function nullish(args) {
  return !(args !== null && args !== undefined)
}

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const { version } = await fetchLatestBaileysVersion()

  const conn = makeWASocket({
    logger,
    version,
    browser: Browsers.windows('Chrome'),
    printQRInTerminal: false,

    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    }
  })

  store.bind(conn.ev)

  conn.chats = {}

  conn.decodeJid = (jid) => {
    if (!jid || typeof jid !== 'string') return jid

    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {}
      return (
        decode.user &&
        decode.server &&
        decode.user + '@' + decode.server
      )
    }

    return jid
  }

  conn.normalizeJid = (jid) => {
    if (!jid) return jid
    return conn.decodeJid(jid)
  }

  conn.logger = {
    info(...args) {
      console.log(
        chalk.bold.bgGreen(' INFO '),
        chalk.white(new Date().toLocaleTimeString()),
        chalk.cyan(format(...args))
      )
    },

    error(...args) {
      console.log(
        chalk.bold.bgRed(' ERROR '),
        chalk.white(new Date().toLocaleTimeString()),
        chalk.red(format(...args))
      )
    },

    warn(...args) {
      console.log(
        chalk.bold.bgYellow.black(' WARNING '),
        chalk.white(new Date().toLocaleTimeString()),
        chalk.yellow(format(...args))
      )
    }
  }

  conn.getName = (jid = '', withoutContact = false) => {
    jid = conn.decodeJid(jid)

    withoutContact = conn.withoutContact || withoutContact

    let v

    if (jid.endsWith('@g.us')) {
      return new Promise(async (resolve) => {
        v = store.contacts[jid] || {}

        if (!(v.name || v.subject)) {
          v = conn.groupMetadata(jid) || {}
        }

        resolve(
          v.name ||
          v.subject ||
          PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        )
      })
    } else {
      v =
        jid === '0@s.whatsapp.net'
          ? {
              jid,
              vname: 'WhatsApp'
            }
          : areJidsSameUser(jid, conn.user.id)
          ? conn.user
          : store.contacts[jid] || {}

      return (
        (!withoutContact && v.name) ||
        v.subject ||
        v.vname ||
        v.notify ||
        PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
      )
    }
  }

  conn.sendText = (jid, text, quoted = '', options = {}) => {
    return conn.sendMessage(
      jid,
      { text, ...options },
      { quoted }
    )
  }

  conn.sendImage = async (jid, path, caption = '', quoted = '', options = {}) => {

    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], 'base64')
      : /^https?:\/\//.test(path)
      ? await (await fetch(path)).buffer()
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0)

    return await conn.sendMessage(
      jid,
      {
        image: buffer,
        caption,
        ...options
      },
      { quoted }
    )
  }

  conn.sendFile = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {

    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], 'base64')
      : /^https?:\/\//.test(path)
      ? await (await fetch(path)).buffer()
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0)

    let type = await fileTypeFromBuffer(buffer) || {
      mime: 'application/octet-stream',
      ext: '.bin'
    }

    return conn.sendMessage(
      jid,
      {
        document: buffer,
        mimetype: type.mime,
        fileName,
        caption,
        ...options
      },
      { quoted }
    )
  }

  conn.downloadMediaMessage = async (message) => {

    let mime = (
      message.msg ||
      message
    ).mimetype || ''

    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, '')
      : mime.split('/')[0]

    const stream = await downloadContentFromMessage(
      message,
      messageType
    )

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
  }

  if (!conn.authState.creds.registered) {

    const phoneNumber = '573000000000'

    setTimeout(async () => {

      let code = await conn.requestPairingCode(phoneNumber)

      code = code?.match(/.{1,4}/g)?.join('-') || code

      console.log(
        chalk.black(chalk.bgGreen(' CODIGO ')),
        chalk.green(code)
      )

    }, 3000)
  }

  conn.ev.on('creds.update', saveCreds)

  conn.ev.on('connection.update', async (update) => {

    const { connection, lastDisconnect } = update

    if (connection === 'connecting') {
      conn.logger.info('Conectando a WhatsApp...')
    }

    if (connection === 'open') {
      conn.logger.info('Bot conectado correctamente')
    }

    if (connection === 'close') {

      conn.logger.error('Conexion cerrada')

      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) {
        startBot()
      } else {
        console.log(
          chalk.redBright(
            'Sesion cerrada, elimina la carpeta session'
          )
        )
      }
    }
  })

  conn.ev.on('messages.upsert', async ({ messages }) => {

    const m = messages[0]

    if (!m.message) return
    if (m.key.fromMe) return

    const from = m.key.remoteJid

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      ''

    console.log(
      chalk.blueBright('Mensaje =>'),
      body
    )

    if (body === '.ping') {

      await conn.sendText(
        from,
        '🏓 Pong',
        m
      )
    }

    if (body === '.menu') {

      let txt = `
╭━━〔 SIMPLE BOT 〕━━⬣
┃
┃ ✦ .ping
┃ ✦ .menu
┃
╰━━━━━━━━━━━━⬣
`

      await conn.sendText(
        from,
        txt,
        m
      )
    }
  })
}

startBot()
