const MAX_MENTIONS = 40
const DELAY_MS = 1500

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

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

    const users = participants
      .map(p => p.id || p.jid)
      .filter(jid =>
        jid && jid.endsWith('@s.whatsapp.net')
      )

    if (!users.length) {
      return m.reply('❌ No se encontraron miembros')
    }

    const total = users.length

    const groupName =
      metadata.subject || 'Grupo'

    const mensaje =
      text?.trim() || '⚠️ Atención general'

    const chunks = []

    for (let i = 0; i < users.length; i += MAX_MENTIONS) {
      chunks.push(users.slice(i, i + MAX_MENTIONS))
    }

    for (let i = 0; i < chunks.length; i++) {

      const chunk = chunks[i]

      if (!chunk.length) continue

      let teks = `
╭━━━〔 ⚡ LLAMADO GLOBAL ⚡ 〕━━━⬣
┃ 🛸 Grupo: ${groupName}
┃ 👥 Miembros: ${total}
┃ 📣 Mensaje:
┃ ➤ ${mensaje}
╰━━━━━━━━━━━━━━━━⬣

┏━━━〔 🔥 INVOCADOS 🔥 〕━━━⬣
`

      for (const user of chunk) {
        teks += `┃ ⚔️ @${user.split('@')[0]}\n`
      }

      teks += `┗━━━━━━━━━━━━━━━━⬣

📋 Parte ${i + 1}/${chunks.length}
👑 GUERRA BOT • ACTIVADO
`

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
