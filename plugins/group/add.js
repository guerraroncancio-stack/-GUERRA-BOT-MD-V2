const addCommand = {
  name: 'add',
  alias: ['atd', 'agregar'],
  category: 'admin',
  botAdmin: true,
  group: true,

  run: async (m, { conn, text, isAdmin, isBotAdmin }) => {
    try {

      if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

      // 👮 SOLO ADMINS
      if (!isAdmin) {
        return m.reply('❌ Solo administradores pueden usar este comando.')
      }

      if (!isBotAdmin) {
        return m.reply('❌ Necesito ser admin para agregar usuarios.')
      }

      let input = text?.trim()

      // 👤 SI ES MENCIÓN O QUOTED
      let jid =
        m.quoted?.sender ||
        (m.mentionedJid && m.mentionedJid[0]) ||
        null

      // 📱 SI ES NÚMERO
      if (!jid && input) {
        const num = input.replace(/[^0-9]/g, '')
        if (num.length < 8) return m.reply('❌ Número inválido.')
        jid = `${num}@s.whatsapp.net`
      }

      if (!jid) {
        return m.reply('❌ Ingresa un número o menciona a alguien.')
      }

      await m.react('⏳')

      // 📦 METADATA
      const groupMetadata = await conn.groupMetadata(m.chat)
      const participants = groupMetadata.participants.map(p => p.id)

      // ⚠️ YA EN GRUPO
      if (participants.includes(jid)) {
        await m.react('⚠️')
        return m.reply('⚠️ Este usuario ya está en el grupo.')
      }

      // ➕ INTENTAR AGREGAR
      let added = false

      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
        added = true
      } catch (e) {
        added = false
      }

      // ✔️ ÉXITO
      if (added) {
        await m.react('✅')

        return conn.sendMessage(m.chat, {
          text:
`👤 USUARIO AGREGADO

• Usuario: @${jid.split('@')[0]}
• Estado: añadido correctamente`,
          mentions: [jid]
        }, { quoted: m })
      }

      // ❌ FALLBACK: INVITACIÓN
      const code = await conn.groupInviteCode(m.chat).catch(() => null)

      if (!code) {
        await m.react('❌')
        return m.reply('❌ No se pudo generar enlace de invitación.')
      }

      const invite =
`👋 INVITACIÓN DE GRUPO

No se pudo agregar automáticamente.

🔗 Únete aquí:
https://chat.whatsapp.com/${code}`

      await conn.sendMessage(jid, { text: invite }).catch(() => null)

      await m.react('📨')

      return conn.sendMessage(m.chat, {
        text:
`📨 INVITACIÓN ENVIADA

• Usuario: @${jid.split('@')[0]}
• Acción: enlace enviado`,
        mentions: [jid]
      }, { quoted: m })

    } catch (err) {
      console.log(err)
      await m.react('❌')
      return m.reply('❌ Error inesperado al ejecutar add.')
    }
  }
}

export default addCommand
