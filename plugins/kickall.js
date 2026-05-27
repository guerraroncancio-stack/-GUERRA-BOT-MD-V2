export default async function kickall(m, { conn, participants, isOwner }) {
    try {
        if (!m.isGroup) return m.reply('❌ Solo funciona en grupos.')

        // 🔒 SOLO OWNER DEL BOT
        if (!isOwner) return m.reply('❌ Este comando es solo para el owner del bot.')

        const botJid = conn.user.jid
        const users = participants.map(u => u.id)

        m.reply(`⚠️ Expulsando a ${users.length} miembros...`)

        for (const user of users) {
            if (user === botJid) continue

            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                await new Promise(r => setTimeout(r, 600))
            } catch (e) {
                console.log('No se pudo expulsar:', user)
            }
        }

        m.reply('✅ Kickall completado.')
    } catch (err) {
        console.log(err)
        m.reply('❌ Error ejecutando kickall.')
    }
}
