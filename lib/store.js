import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync
} from 'fs'

import path from 'path'

import {
  initAuthCreds,
  BufferJSON,
  proto
} from '@whiskeysockets/baileys'

/*
━━━━━━━━━━━━━━━━━━━━━━━
 STORE SIMPLE FIX
━━━━━━━━━━━━━━━━━━━━━━━
*/

const KEY_MAP = {
  'pre-key': 'preKeys',
  session: 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 BIND EVENTS
━━━━━━━━━━━━━━━━━━━━━━━
*/

function bind(conn) {

  if (!conn.chats) {
    conn.chats = {}
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CONTACTS
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  async function updateNameToDb(contacts) {

    if (!contacts) return

    try {

      contacts = contacts.contacts || contacts

      for (const contact of contacts) {

        let id = conn.decodeJid(contact.id)

        if (!id || id === 'status@broadcast') {
          continue
        }

        let chats = conn.chats[id]

        if (!chats) {
          chats = conn.chats[id] = {
            id
          }
        }

        const isGroup = id.endsWith('@g.us')

        conn.chats[id] = {
          ...chats,
          ...contact,
          id,

          ...(isGroup
            ? {
                subject:
                  contact.subject ||
                  contact.name ||
                  chats.subject ||
                  ''
              }
            : {
                name:
                  contact.notify ||
                  contact.name ||
                  chats.name ||
                  ''
              })
        }
      }

    } catch (e) {
      console.error(e)
    }
  }

  conn.ev.on('contacts.upsert', updateNameToDb)
  conn.ev.on('contacts.set', updateNameToDb)
  conn.ev.on('groups.update', updateNameToDb)

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CHATS
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  conn.ev.on('chats.set', async ({ chats }) => {

    try {

      for (let chat of chats) {

        let {
          id,
          name,
          readOnly
        } = chat

        id = conn.decodeJid(id)

        if (!id || id === 'status@broadcast') {
          continue
        }

        const isGroup = id.endsWith('@g.us')

        let data = conn.chats[id]

        if (!data) {
          data = conn.chats[id] = { id }
        }

        data.isChats = !readOnly

        if (name) {
          data[isGroup ? 'subject' : 'name'] = name
        }

        if (isGroup) {

          const metadata = await conn
            .groupMetadata(id)
            .catch(() => null)

          if (!metadata) continue

          data.subject =
            metadata.subject ||
            name ||
            data.subject

          data.metadata = metadata
        }
      }

    } catch (e) {
      console.error(e)
    }
  })

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GROUP UPDATE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  conn.ev.on(
    'group-participants.update',
    async ({ id }) => {

      try {

        id = conn.decodeJid(id)

        if (!id) return

        let chats = conn.chats[id]

        if (!chats) {
          chats = conn.chats[id] = { id }
        }

        chats.isChats = true

        const metadata = await conn
          .groupMetadata(id)
          .catch(() => null)

        if (!metadata) return

        chats.subject = metadata.subject
        chats.metadata = metadata

      } catch (e) {
        console.error(e)
      }
    }
  )

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GROUP SETTINGS
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  conn.ev.on('groups.update', async (groupsUpdates) => {

    try {

      for (const update of groupsUpdates) {

        const id = conn.decodeJid(update.id)

        if (!id || !id.endsWith('@g.us')) {
          continue
        }

        let chats = conn.chats[id]

        if (!chats) {
          chats = conn.chats[id] = { id }
        }

        chats.isChats = true

        const metadata = await conn
          .groupMetadata(id)
          .catch(() => null)

        if (metadata) {
          chats.metadata = metadata
        }

        chats.subject =
          update.subject ||
          metadata?.subject ||
          chats.subject
      }

    } catch (e) {
      console.error(e)
    }
  })

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CHATS UPSERT
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  conn.ev.on('chats.upsert', (chat) => {

    try {

      if (!chat.id) return

      const id = conn.decodeJid(chat.id)

      if (!id) return

      conn.chats[id] = {
        ...(conn.chats[id] || {}),
        ...chat,
        id,
        isChats: true
      }

    } catch (e) {
      console.error(e)
    }
  })

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   PRESENCE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  conn.ev.on(
    'presence.update',
    async ({ id, presences }) => {

      try {

        const sender =
          Object.keys(presences)[0] || id

        const _sender = conn.decodeJid(sender)

        const presence =
          presences[sender]?.lastKnownPresence ||
          'available'

        let chats = conn.chats[_sender]

        if (!chats) {
          chats = conn.chats[_sender] = {
            id: _sender
          }
        }

        chats.presences = presence

      } catch (e) {
        console.error(e)
      }
    }
  )
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 SINGLE FILE AUTH
━━━━━━━━━━━━━━━━━━━━━━━
*/

function useSingleFileAuthState(
  filename = './session/creds.json',
  logger = console
) {

  const folder = path.dirname(filename)

  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true })
  }

  let creds
  let keys = {}

  let saveCount = 0

  const saveState = (force = false) => {

    saveCount++

    if (force || saveCount >= 5) {

      logger?.trace?.('Guardando sesión...')

      writeFileSync(
        filename,
        JSON.stringify(
          {
            creds,
            keys
          },
          BufferJSON.replacer,
          2
        )
      )

      saveCount = 0
    }
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   LOAD SESSION
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  if (existsSync(filename)) {

    const result = JSON.parse(
      readFileSync(filename, {
        encoding: 'utf-8'
      }),
      BufferJSON.reviver
    )

    creds = result.creds
    keys = result.keys || {}

  } else {

    creds = initAuthCreds()
    keys = {}
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   RETURN
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  return {

    state: {

      creds,

      keys: {

        get(type, ids) {

          const key = KEY_MAP[type]

          return ids.reduce((dict, id) => {

            let value = keys[key]?.[id]

            if (value) {

              if (type === 'app-state-sync-key') {
                value = proto.AppStateSyncKeyData
                  .fromObject(value)
              }

              dict[id] = value
            }

            return dict

          }, {})
        },

        set(data) {

          for (const _key in data) {

            const key = KEY_MAP[_key]

            keys[key] = keys[key] || {}

            Object.assign(
              keys[key],
              data[_key]
            )
          }

          saveState()
        }
      }
    },

    saveState
  }
}

export default {
  bind,
  useSingleFileAuthState
}
