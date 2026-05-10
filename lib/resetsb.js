import {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  Browsers
} from '@whiskeysockets/baileys'

import fs from 'fs'
import chalk from 'chalk'
import pino from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'

import { makeWASocket } from './simple.js'
import store from './store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JADIBTS_DIR = global.jadi || './jadibts'

global.conns = global.conns || []

const logger = pino({
  level: 'silent'
})

/* =========================
   INICIAR TODOS LOS SUBBOTS
========================= */

export async function startSub() {

  try {

    if (!fs.existsSync(JADIBTS_DIR)) {
      console.log(
        chalk.redBright('❌ No hay subbots guardados')
      )
      return
    }

    const folders = fs.readdirSync(JADIBTS_DIR)

    let connected = 0

    for (const folder of folders) {

      const ok = await startSubBotIfValid(folder)

      if (ok) connected++
    }

    console.log(
      chalk.greenBright(`✅ ${connected}/${folders.length} subbots reconectados`)
    )

  } catch (err) {
    console.error('❌ Error startSub:', err)
  }
}

/* =========================
   VALIDAR SUBBOT
========================= */

async function startSubBotIfValid(folder) {

  try {

    const credsPath = path.join(
      JADIBTS_DIR,
      folder,
      'creds.json'
    )

    if (!fs.existsSync(credsPath)) return false

    const creds = JSON.parse(
      fs.readFileSync(credsPath)
    )

    if (!creds?.noiseKey || creds?.fstop) {

      fs.rmSync(
        path.join(JADIBTS_DIR, folder),
        { recursive: true, force: true }
      )

      return false
    }

    await startSubBot(folder)

    return true

  } catch (err) {

    console.error(err)

    try {
      fs.rmSync(
        path.join(JADIBTS_DIR, folder),
        { recursive: true, force: true }
      )
    } catch {}

    return false
  }
}

/* =========================
   CREAR SOCKET
========================= */

async function startSubBot(folder) {

  const sessionPath = path.join(JADIBTS_DIR, folder)

  try {

    const {
      state,
      saveCreds
    } = await useMultiFileAuthState(sessionPath)

    const { version } =
      await fetchLatestBaileysVersion()

    const socket = makeWASocket({

      version,

      logger,

      printQRInTerminal: false,

      browser: Browsers.macOS('Desktop'),

      markOnlineOnConnect: true,

      generateHighQualityLinkPreview: true,

      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          logger
        )
      },

      getMessage: async (key) => {

        try {

          const jid = jidNormalizedUser(key.remoteJid)

          return (
            await store.loadMessage(
              jid,
              key.id
            )
          )?.message || undefined

        } catch {
          return undefined
        }
      }

    })

    socket.isInit = false
    socket.uptime = Date.now()

    socket.ev.on(
      'creds.update',
      saveCreds
    )

    socket.ev.on(
      'connection.update',
      async (update) => {

        const {
          connection,
          lastDisconnect,
          isNewLogin
        } = update

        if (isNewLogin)
          socket.isInit = false

        if (connection === 'open') {

          socket.isInit = true

          console.log(
            chalk.greenBright(
              `✅ Subbot conectado -> ${folder}`
            )
          )

          await joinChannels(socket)

        }

        if (connection === 'close') {

          socket.isInit = false

          const reason =
            lastDisconnect?.error?.output?.statusCode ||
            lastDisconnect?.error?.output?.payload?.statusCode

          console.log(
            chalk.redBright(
              `❌ Desconectado ${folder} -> ${reason}`
            )
          )

          await handleDisconnect(
            reason,
            socket,
            folder
          )
        }
      }
    )

    process.on(
      'unhandledRejection',
      async (reason) => {

        const msg = reason?.message || ''

        if (
          msg.includes('Bad MAC') ||
          msg.includes('Invalid bytes')
        ) {

          try {

            socket.ws?.close()

            fs.rmSync(sessionPath, {
              recursive: true,
              force: true
            })

            removeSocket(socket)

          } catch {}
        }
      }
    )

    await loadHandler(socket)

    socket.cleanupInterval =
      setInterval(async () => {

        if (!socket.user) {

          try {
            socket.ws?.close()
          } catch {}

          socket.ev.removeAllListeners()

          removeSocket(socket)

          clearInterval(
            socket.cleanupInterval
          )
        }

      }, 60000)

    global.conns.push(socket)

    return socket

  } catch (err) {

    console.error(
      `❌ Error iniciando ${folder}`,
      err
    )

    try {
      fs.rmSync(sessionPath, {
        recursive: true,
        force: true
      })
    } catch {}
  }
}

/* =========================
   DESCONECTAR
========================= */

async function handleDisconnect(
  reason,
  socket,
  folder
) {

  const sessionPath =
    path.join(JADIBTS_DIR, folder)

  if ([
    DisconnectReason.badSession,
    DisconnectReason.loggedOut,
    401,
    403,
    404,
    405
  ].includes(reason)) {

    console.log(
      chalk.redBright(
        `🗑️ Eliminando sesión dañada ${folder}`
      )
    )

    try {
      fs.rmSync(sessionPath, {
        recursive: true,
        force: true
      })
    } catch {}

    removeSocket(socket)

    return
  }

  console.log(
    chalk.yellowBright(
      `🔄 Reiniciando ${folder}`
    )
  )

  try {

    removeSocket(socket)

    socket.ws?.close()

    await delay(5000)

    await startSubBot(folder)

  } catch (err) {
    console.error(err)
  }
}

/* =========================
   LOAD HANDLER
========================= */

async function loadHandler(socket) {

  try {

    const handlerFile =
      path.join(__dirname, '../handler.js')

    const handlerModule =
      await import(
        handlerFile + '?update=' + Date.now()
      )

    if (!handlerModule?.handler) return

    socket.handler =
      handlerModule.handler.bind(socket)

    socket.ev.removeAllListeners(
      'messages.upsert'
    )

    socket.ev.on(
      'messages.upsert',
      socket.handler
    )

  } catch (err) {
    console.error(
      '❌ Error cargando handler:',
      err
    )
  }
}

/* =========================
   CANALES
========================= */

async function joinChannels(conn) {

  try {

    await conn.newsletterFollow(
      global.idcanal ||
      '120363427020147321@newsletter'
    )

  } catch {}
}

/* =========================
   VERIFICAR SUBBOTS
========================= */

export async function checkSubBots() {

  for (const socket of global.conns) {

    try {

      if (
        !socket?.user ||
        !socket?.authState?.creds
      ) {

        removeSocket(socket)

        continue
      }

      if (
        !socket.isInit &&
        !socket._reconnecting
      ) {

        socket._reconnecting = true

        const jid =
          socket.authState?.creds?.me?.id

        if (jid) {

          await startSubBot(
            jid.split(':')[0]
          )
        }

        socket._reconnecting = false
      }

    } catch (err) {
      console.error(err)
    }
  }
}

/* =========================
   HELPERS
========================= */

function removeSocket(socket) {

  const index =
    global.conns.indexOf(socket)

  if (index >= 0) {
    global.conns.splice(index, 1)
  }
}

function delay(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}

/* =========================
   AUTO CHECK
========================= */

setInterval(
  checkSubBots,
  60000
)
