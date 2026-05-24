import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const DEFAULT_PP = 'https://api.dix.lat/media2/1777604199636.jpg'

async function safeFetchBuffer(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return Buffer.from(buf)
  } catch {
    return null
  }
}

function normalizeJid(jid) {
  if (!jid || typeof jid !== 'string') return null
  return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`
}

function buildWelcome(user, group) {
  return `
╭━━〔 👑 BIENVENIDO/A 👑 〕━━⬣
┃ ✦ Usuario: ${user}
┃ ✦ Grupo: ${group}
╰━━━━━━━━━━━━⬣

✨ Bienvenido al grupo, respeta las reglas.
`.trim()
}

export async function before(m, { conn, groupMetadata }) {
  try {

    // ❌ FIX CRÍTICO: forma correcta de detectar grupo
    const jid = m?.key?.remoteJid
    if (!jid || !jid.endsWith('@g.us')) return true

    // ❌ FIX CRÍTICO: stub correcto
    const type = m?.messageStubType
    if (!type) return true

    const params = m?.messageStubParameters || []
    if (!params.length) return true

    // DB SAFE
    global.db = global.db || { data: { chats: {} } }
    global.db.data.chats = global.db.data.chats || {}

    let chat = global.db.data.chats[jid]
    if (!chat) chat = global.db.data.chats[jid] = {}

    chat.bienvenida ??= true
    chat.sWelcome ??= ''
    chat.sBye ??= ''

    if (!chat.bienvenida) return true

    const group = groupMetadata?.subject || 'Grupo'

    const isAdd = type === WAMessageStubType.GROUP_PARTICIPANT_ADD
    const isLeave = type === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    const isRemove = type === WAMessageStubType.GROUP_PARTICIPANT_REMOVE

    if (!isAdd && !isLeave && !isRemove) return true

    for (const raw of params) {

      const userJid = normalizeJid(raw)
      if (!userJid) continue

      const user = `@${userJid.split('@')[0]}`

      let text = ''

      if (isAdd) {
        text = chat.sWelcome?.trim()
          ? chat.sWelcome.replace(/@user/g, user).replace(/@group/g, group)
          : buildWelcome(user, group)
      }

      if (isLeave) {
        text = chat.sBye?.trim()
          ? chat.sBye.replace(/@user/g, user).replace(/@group/g, group)
          : `👋 ${user} salió del grupo *${group}*`
      }

      if (isRemove) {
        text = chat.sBye?.trim()
          ? chat.sBye.replace(/@user/g, user).replace(/@group/g, group)
          : `🚫 ${user} fue eliminado del grupo`
      }

      let pp = DEFAULT_PP
      try {
        pp = await conn.profilePictureUrl(userJid, 'image')
      } catch {}

      const img = await safeFetchBuffer(pp)

      const payload = img
        ? { image: img, caption: text, mentions: [userJid] }
        : { text, mentions: [userJid] }

      await conn.sendMessage(jid, payload)
    }

    return true

  } catch (e) {
    console.log('WELCOME ERROR:', e)
    return true
  }
}
