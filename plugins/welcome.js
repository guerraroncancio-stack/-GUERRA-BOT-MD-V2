import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const DEFAULT_PP = 'https://api.dix.lat/media2/1777604199636.jpg'

// =========================
// BUFFER SAFE
// =========================
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

// =========================
// TEMPLATE SYSTEM
// =========================
function applyTemplate(template, vars, fallback) {
  const t = typeof template === 'string' ? template.trim() : ''
  if (!t) return fallback

  return t
    .replace(/@user/g, vars.user)
    .replace(/@group/g, vars.group)
    .replace(/@desc/g, vars.desc)
}

// =========================
// JID NORMALIZER
// =========================
function normalizeJid(jid) {
  if (!jid) return null
  if (typeof jid !== 'string') return null
  return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`
}

// =========================
// UNIQUE WELCOME DESIGN
// =========================
function buildWelcome(user, group, desc) {
  return `
╭━━〔 👑 BIENVENIDO/A 👑 〕━━⬣
┃ ✦ Usuario: ${user}
┃ ✦ Grupo: ${group}
┃ ✦ Info: ${desc}
╰━━━━━━━━━━━━⬣

✨ Disfruta tu estancia y respeta las reglas del grupo.
`.trim()
}

// =========================
// MAIN BEFORE
// =========================
export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m?.isGroup) return true

    const type = m.messageStubType
    if (!type) return true

    const params = Array.isArray(m.messageStubParameters)
      ? m.messageStubParameters
      : []

    if (!params.length) return true

    // =========================
    // DB SAFE
    // =========================
    global.db = global.db || { data: { chats: {} } }
    global.db.data.chats = global.db.data.chats || {}

    let chat = global.db.data.chats[m.chat]
    if (!chat) chat = global.db.data.chats[m.chat] = {}

    chat.sWelcome ??= ''
    chat.sBye ??= ''
    chat.bienvenida ??= true

    if (!chat.bienvenida) return true

    const group = groupMetadata?.subject || 'Grupo'
    const desc = groupMetadata?.desc || 'sin descripción'

    const isAdd = type === WAMessageStubType.GROUP_PARTICIPANT_ADD
    const isLeave = type === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    const isRemove = type === WAMessageStubType.GROUP_PARTICIPANT_REMOVE

    if (!isAdd && !isLeave && !isRemove) return true

    for (const raw of params) {
      const jid = normalizeJid(raw)
      if (!jid) continue

      const userTag = `@${jid.split('@')[0]}`
      const vars = { user: userTag, group, desc }

      // =========================
      // CAPTION LOGIC
      // =========================
      let caption = ''

      if (isAdd) {
        caption =
          chat.sWelcome?.trim()
            ? applyTemplate(chat.sWelcome, vars, '')
            : buildWelcome(userTag, group, desc)
      }

      if (isLeave) {
        caption =
          chat.sBye?.trim()
            ? applyTemplate(chat.sBye, vars, '')
            : `👋 ${userTag} salió del grupo *${group}*.`
      }

      if (isRemove) {
        caption =
          chat.sBye?.trim()
            ? applyTemplate(chat.sBye, vars, '')
            : `🚫 ${userTag} fue eliminado del grupo.`
      }

      // =========================
      // PROFILE PIC SAFE
      // =========================
      let pp = DEFAULT_PP
      try {
        pp = await conn.profilePictureUrl(jid, 'image')
      } catch {}

      const img = await safeFetchBuffer(pp)

      const payload = img
        ? { image: img, caption, mentions: [jid] }
        : { text: caption, mentions: [jid] }

      await conn.sendMessage(m.chat, payload)
    }

    return true
  } catch (e) {
    console.log('WELCOME ERROR:', e)
    return true
  }
}
