import pkg from '@whiskeysockets/baileys'

const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode
} = pkg

import pino from 'pino'
import fs from 'fs'
import chalk from 'chalk'
import qrcode from 'qrcode'

import { smsg } from './simple.js'

/*
━━━━━━━━━━━━━━━━━━━━━━━
 GLOBALS
━━━━━━━━━━━━━━━━━━━━━━━
*/

if (!global.conns) {
  global.conns = []
}

const reconnectAttempts = {}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 CLEAN JID
━━━━━━━━━━━━━━━━━━━━━━━
*/

const cleanJid = (jid = '') => {
  return jid.replace(/:\d+/g, '').split('@')[0]
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 START MOD BOT
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function startModBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  commandFlags = {},
  isCommand = false
) {

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   DATA
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const senderId = m?.sender

  const id =
    phone ||
    senderId?.split('@')[0]

  const sessionFolder =
    `./ModSessions/${id}`

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   AUTH
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(
    sessionFolder
  )

  const {
    version
  } = await fetchLatestBaileysVersion()

  const logger = pino({
    level: 'silent'
  })

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   SOCKET
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const sock = makeWASocket({

    version,

    logger,

    printQRInTerminal: false,

    browser: [
      'Windows',
      'Chrome',
      '20.0.04'
    ],

    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        logger
      )
    },

    markOnlineOnConnect: false,

    generateHighQualityLinkPreview: true,

    syncFullHistory: false,

    keepAliveIntervalMs: 45000,

    defaultQueryTimeoutMs: 60000,

    getMessage: async () => ({
      conversation: ''
    })
  })

  sock.isInit = false

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   SAVE CREDS
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  sock.ev.on(
    'creds.update',
    saveCreds
  )

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   DECODE JID
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  sock.decodeJid = (jid) => {

    if (!jid) return jid

    if (/:\d+@/gi.test(jid)) {

      const decode =
        jidDecode(jid) || {}

      return (
        decode.user &&
        decode.server &&
        `${decode.user}@${decode.server}`
      ) || jid
    }

    return jid
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CONNECTION UPDATE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  sock.ev.on(
    'connection.update',
    async ({
      connection,
      lastDisconnect,
      isNewLogin,
      qr
    }) => {

      if (isNewLogin) {
        sock.isInit = false
      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━
       OPEN
      ━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (connection === 'open') {

        sock.isInit = true

        sock.userId = cleanJid(
          sock.user?.id || ''
        )

        const botJid =
          `${sock.userId}@s.whatsapp.net`

        /*
        ━━━━━━━━━━━━━━━━━━━━━━━
         DATABASE
        ━━━━━━━━━━━━━━━━━━━━━━━
        */

        if (!globalThis.db.data.settings[botJid]) {
          globalThis.db.data.settings[botJid] = {}
        }

        globalThis.db.data.settings[botJid].botmod = true
        globalThis.db.data.settings[botJid].botprem = false
        globalThis.db.data.settings[botJid].type = 'Mod'

        /*
        ━━━━━━━━━━━━━━━━━━━━━━━
         GLOBAL CONNS
        ━━━━━━━━━━━━━━━━━━━━━━━
        */

        const exists = global.conns.find(
          c => c.userId === sock.userId
        )

        if (!exists) {
          global.conns.push(sock)
        }

        /*
        ━━━━━━━━━━━━━━━━━━━━━━━
         SEND CONNECT MSG
        ━━━━━━━━━━━━━━━━━━━━━━━
        */

        if (
          m &&
          client &&
          isCommand &&
          commandFlags[senderId]
        ) {

          await client.sendMessage(
            m.chat,
            {
              text:
                '✦ Nuevo socket conectado tipo *Mod*'
            },
            { quoted: m }
          )

          delete commandFlags[senderId]
        }

        delete reconnectAttempts[
          sock.userId || id
        ]

        console.log(
          chalk.green(
            `[ MOD-BOT ] Conectado: ${sock.userId}`
          )
        )
      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━
       CLOSE
      ━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (connection === 'close') {

        const botId =
          sock.userId || id

        const reason =
          lastDisconnect?.error?.output?.statusCode ||
          0

        reconnectAttempts[botId] =
          (reconnectAttempts[botId] || 0) + 1

        const attempts =
          reconnectAttempts[botId]

        console.log(
          chalk.red(
            `[ MOD-BOT ] Desconectado ${botId}`
          ),
          `Intento: ${attempts}`
        )

        /*
        ━━━━━━━━━━━━━━━━━━━━━━━
         LOGGED OUT
        ━━━━━━━━━━━━━━━━━━━━━━━
        */

        if (
          reason === DisconnectReason.loggedOut ||
          reason === 401 ||
          reason === 403
        ) {

          if (attempts >= 5) {

            console.log(
              chalk.red(
                `[ MOD-BOT ] Eliminando sesión ${botId}`
              )
            )

            try {

              fs.rmSync(
                sessionFolder,
                {
                  recursive: true,
                  force: true
                }
              )

            } catch (e) {
              console.log(e)
            }

            delete reconnectAttempts[botId]

            return
          }
        }

        /*
        ━━━━━━━━━━━━━━━━━━━━━━━
         RECONNECT
        ━━━━━━━━━━━━━━━━━━━━━━━
        */

        setTimeout(() => {

          startModBot(
            m,
            client,
            caption,
            isCode,
            phone,
            chatId,
            {},
            isCommand
          )

        }, 3000)
      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━
       QR IMAGE
      ━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (
        qr &&
        !isCode &&
        client &&
        m &&
        commandFlags[senderId]
      ) {

        try {

          const qrBuffer =
            await qrcode.toBuffer(qr, {
              scale: 8
            })

          const msg =
            await client.sendMessage(
              m.chat,
              {
                image: qrBuffer,
                caption
              },
              { quoted: m }
            )

          delete commandFlags[senderId]

          setTimeout(() => {

            client.sendMessage(
              m.chat,
              {
                delete: msg.key
              }
            ).catch(() => {})

          }, 60000)

        } catch (e) {

          console.log(
            chalk.red(
              `[ QR ERROR ]`
            ),
            e
          )
        }
      }

      /*
      ━━━━━━━━━━━━━━━━━━━━━━━
       PAIRING CODE
      ━━━━━━━━━━━━━━━━━━━━━━━
      */

      if (
        qr &&
        isCode &&
        phone &&
        client &&
        chatId &&
        commandFlags[senderId]
      ) {

        try {

          let code =
            await sock.requestPairingCode(
              phone
            )

          code =
            code.match(/.{1,4}/g)?.join('-') ||
            code

          const msg =
            await client.reply(
              chatId,
              caption,
              m
            )

          const codeMsg =
            await client.sendMessage(
              chatId,
              {
                text: code
              },
              { quoted: m }
            )

          delete commandFlags[senderId]

          setTimeout(() => {

            client.sendMessage(
              chatId,
              {
                delete: msg.key
              }
            ).catch(() => {})

            client.sendMessage(
              chatId,
              {
                delete: codeMsg.key
              }
            ).catch(() => {})

          }, 60000)

        } catch (e) {

          console.log(
            chalk.red(
              `[ PAIR ERROR ]`
            ),
            e
          )
        }
      }
    }
  )

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   MESSAGE HANDLER
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  sock.ev.on(
    'messages.upsert',
    async ({
      messages,
      type
    }) => {

      if (type !== 'notify') {
        return
      }

      for (const raw of messages) {

        if (!raw.message) {
          continue
        }

        try {

          const msg = smsg(
            sock,
            raw
          )

          const handler =
            await import('../handler.js')

          await handler.default(
            sock,
            msg,
            messages
          )

        } catch (e) {

          console.log(
            chalk.red(
              `[ HANDLER ERROR ]`
            ),
            e
          )
        }
      }
    }
  )

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   ERROR
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  process.on(
    'uncaughtException',
    console.error
  )

  return sock
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 EXPORT
━━━━━━━━━━━━━━━━━━━━━━━
*/

export {
  startModBot
}
