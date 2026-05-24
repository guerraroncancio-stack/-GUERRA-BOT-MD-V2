const MAX_MENTIONS = 40
const DELAY_MS = 1500

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

async function handler(m, {
  conn,
  participants,
  groupMetadata,
  text
}) {

  try {

    if (!m.isGroup) {
      return m.reply(
        '❌ Este comando solo funciona en grupos'
      )
    }

    if (!participants || !Array.isArray(participants)) {
      return m.reply(
        '❌ No se pudieron obtener los participantes'
      )
    }

    const users = participants
      .map(p =>
        p.id ||
        p.jid ||
        p.lid ||
        ''
      )
      .filter(jid =>
        jid &&
        jid.endsWith('@s.whatsapp.net')
      )

    if (!users.length) {
      return m.reply(
        '❌ No se encontraron miembros'
      )
    }

    const total =
      users.length

    const groupName =
      groupMetadata?.subject ||
      'Grupo'

    const mensaje =
      text?.trim() ||
      '⚠️ Atención general'

    const chunks = []

    for (
      let i = 0;
      i < users.length;
      i += MAX_MENTIONS
    ) {
      chunks.push(
        users.slice(
          i,
          i + MAX_MENTIONS
        )
      )
    }

    for (let i = 0; i < chunks.length; i++) {

      const chunk = chunks[i]

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
        text: teks.slice(0, 4096),
        mentions: chunk
      }

      if (i === 0) {

        msg.image = {
          url: 'https://api.dix.lat/media2/1777431085383.jpg'
        }

        msg.caption = teks.slice(0, 4096)

        delete msg.text
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

    m.reply(
      '❌ Error al ejecutar el tagall'
    )
  }
}

handler.command = [
  'todos',
  'tagall',
  'invocar'
]

handler.tags = ['group']

handler.group = true

export default handler
