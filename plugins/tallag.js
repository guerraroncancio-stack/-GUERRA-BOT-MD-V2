const MAX_MENTIONS = 40 
const DELAY_MS = 1500   

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, participants, groupMetadata, text }) => {
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo funciona en grupos')
  }

  let users = participants
    .map(u => u.id || u.jid || u.lid || '')
    .filter(v => v && v.includes('@'))

  let total = users.length
  let groupName = groupMetadata.subject || 'Grupo'
  let mensaje = text?.trim() || '⚠️ Atención general'

  if (total === 0) return m.reply('❌ No se encontraron miembros en el grupo.')

  let chunks = []
  for (let i = 0; i < users.length; i += MAX_MENTIONS) {
    chunks.push(users.slice(i, i + MAX_MENTIONS))
  }

  let firstChunk = chunks[0]
  let teks = `╭━━━〔 ⚡ LLAMADO GLOBAL ⚡ 〕━━━⬣
┃ 🛸 Grupo: ${groupName}
┃ 👥 Miembros: ${total}
┃ 📣 Mensaje:
┃ ➤ ${mensaje}
╰━━━━━━━━━━━━━━━━⬣

┏━━━〔 🔥 INVOCADOS 🔥 〕━━━⬣
`
  for (let user of firstChunk) {
    teks += `┃ ⚔️ @${user.split('@')[0]}\n`
  }
  teks += `┗━━━━━━━━━━━━━━━━⬣
${chunks.length > 1 ? `\n📋 Parte 1/${chunks.length}` : ''}
👑 *GUERRA BOT* • ACTIVADO`

  await conn.sendMessage(m.chat, {
    image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
    caption: teks.slice(0, 4096),
    mentions: firstChunk
  }, { quoted: m })

  for (let i = 1; i < chunks.length; i++) {
    await sleep(DELAY_MS) 
    let chunk = chunks[i]
    let partTeks = `┏━━━〔 🔥 INVOCADOS 🔥 〕━━━⬣\n`
    for (let user of chunk) {
      partTeks += `┃ ⚔️ @${user.split('@')[0]}\n`
    }
    partTeks += `┗━━━━━━━━━━━━━━━━⬣\n📋 Parte ${i + 1}/${chunks.length}\n👑 *GUERRA BOT* • ACTIVADO`

    await conn.sendMessage(m.chat, {
      text: partTeks.slice(0, 4096),
      mentions: chunk
    })
  }
}

handler.command = ['todos', 'tagall', 'invocar']
handler.tags = ['group']

export default handler
