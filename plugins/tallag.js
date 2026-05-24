const MAX_MENTIONS = 40
const DELAY_MS = 1500

const sleep = ms =>
  new Promise(res => setTimeout(res, ms))

async function run(m, { conn, groupMetadata, text }) {

  try {

    if (!m.isGroup) {
      return m.reply('❌ Este comando solo funciona en grupos')
    }

    const metadata =
      groupMetadata ||
      await conn.groupMetadata(m.chat)

    const participants =
      metadata?.participants || []

    // 🔥 extracción robusta multi-fork
    const users = participants
      .map(p => p.id || p.jid || p.participant)
      .filter(Boolean)

    if (!users.length) {
      return m.reply('❌ No se encontraron miembros del grupo')
    }

    const groupName =
      metadata.subject || 'Grupo'

    const mensaje =
      text?.trim() || '⚠️ Atención general'

    const total = users.length

    const chunks = []

    for (let i = 0; i < users.length; i += MAX_MENTIONS) {
      chunks.push(users.slice(i, i + MAX_MENTIONS))
    }

    const header = (i, totalChunks) => `
╭━━━〔 ⚡ LLAMADO GLOBAL ⚡ 〕━━━⬣
┃ 🛸 Grupo: ${groupName}
┃ 👥 Miembros: ${total}
┃ 📣 Mensaje:
┃ ➤ ${mensaje}
╰━━━━━━━━━━━━━━━━⬣

┏━━━〔 🔥 INVOCADOS 🔥 〕━━━⬣
`

    const footer = (i, totalChunks) => `
┗━━━━━━━━━━━━━━━━⬣

📦 Parte ${i + 1}/${totalChunks}
👑 GUERRA BOT • ACTIVADO
`

    for (let i = 0; i < chunks.length; i++) {

      const chunk = chunks[i]

      let teks = header(i, chunks.length)

      teks += chunk
        .map(u => `┃ ⚔️ @${u.split('@')[0]}`)
        .join('\n')

      teks += footer(i, chunks.length)

      const msg = {
        mentions: chunk
      }

      if (i === 0) {

        msg.image = {
          url: 'https://api.dix.lat/media2/1777431085383.jpg'
        }

        msg.caption = teks.slice(0, 4096)

      } else {

        msg.text = teks.slice(0, 4096)
      }

      await conn.sendMessage(
        m.chat,
        msg,
        { quoted: m }
      )

      if (i !== chunks.length - 1) {
        await sleep(DELAY_MS)
      }
    }

  } catch (e) {

    console.log(e)

    m.reply('❌ Error al ejecutar el comando')
  }
}

export default {

  name: 'tagall',

  aliases: ['todos', 'invocar'],

  tags: ['group'],

  command: ['tagall', 'todos', 'invocar'],

  group: true,

  run
}
