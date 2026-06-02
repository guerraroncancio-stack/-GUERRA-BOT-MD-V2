import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const DEFAULT_PP = 'https://api.dix.lat/media2/1777604199636.jpg'

async function safeFetchBuffer(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.buffer()
    return Buffer.isBuffer(buf) ? buf : null
  } catch (e) {
    return null
  }
}

function applyTemplate(template, vars, fallback) {
  template = (typeof template === 'string' ? template : '').trim()
  if (!template) return fallback
  return template
    .replace(/@user/g, vars.user)
    .replace(/@group/g, vars.group)
    .replace(/@desc/g, vars.desc)
}

function normalizeJid(jid) {
  if (typeof jid !== 'string') return null
  if (!jid.includes('@')) return jid + '@s.whatsapp.net'
  return jid
}

export async function before(m, ctx) {
  const conn = ctx.conn
  const groupMetadata = ctx.groupMetadata

  if (!m || !m.isGroup) return true
  if (!m.messageStubType) return true

  // db safe
  if (!global.db) global.db = { data: { chats: {} } }
  if (!global.db.data) global.db.data = { chats: {} }
  if (!global.db.data.chats) global.db.data.chats = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = chat = {}

  if (chat.sWelcome == null) chat.sWelcome = ''
  if (chat.sBye == null) chat.sBye = ''
  if (chat.bienvenida == null) chat.bienvenida = true
  if (!chat.bienvenida) return true

  const params = Array.isArray(m.messageStubParameters) ? m.messageStubParameters : []
  if (!params.length) return true

  const group = (groupMetadata && groupMetadata.subject) ? groupMetadata.subject : 'Grupo'
  const desc = (groupMetadata && groupMetadata.desc) ? groupMetadata.desc : 'sin descripción'

  const type = m.messageStubType
  const isAdd = type === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isLeave = type === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
  const isRemove = type === WAMessageStubType.GROUP_PARTICIPANT_REMOVE
  if (!isAdd && !isLeave && !isRemove) return true

  for (let rawJid of params) {
    const jid = normalizeJid(rawJid)
    if (!jid) continue

    const user = '@' + jid.split('@')[0]
    const vars = { user, group, desc }

    let caption = ''
    if (isAdd) {
      caption = applyTemplate(
        chat.sWelcome,
        vars,
        '👋 Bienvenido/a ' + user +
          '\nLe damos una cordial bienvenida al grupo: *' + group + '*.' +
          '\n\n⚠️ Descripción del grupo:\n' + desc
      )
    } else if (isLeave) {
      caption = applyTemplate(
        chat.sBye,
        vars,
        'El usuario ' + user + ' ha abandonado el grupo *' + group + '*. Le deseamos lo mejor.'
      )
    } else {
      caption = applyTemplate(
        chat.sBye,
        vars,
        'El usuario ' + user + ' ha sido *Eliminado* del grupo.'
      )
    }

    // Obtener foto (opcional)
    let pp = DEFAULT_PP
    try {
      pp = await conn.profilePictureUrl(jid, 'image')
    } catch (e) {
      pp = DEFAULT_PP
    }

    const imgBuf = await safeFetchBuffer(pp || DEFAULT_PP)

    // Construir payload válido SIEMPRE
    let payload
    if (imgBuf) {
      payload = { image: imgBuf, caption: caption, mentions: [jid] }
    } else {
      payload = { text: caption, mentions: [jid] }
    }

    // Importante: sin quoted para evitar incompatibilidades con wrappers de m
    await conn.sendMessage(m.chat, payload)
  }

  return true
}
