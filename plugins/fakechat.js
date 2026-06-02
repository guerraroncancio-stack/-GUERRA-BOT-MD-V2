const fakechat = {
    name: 'fakechat',
    alias: ['faketext', 'fake', 'chatfake'],
    category: 'tools',

    run: async (m, { conn, text }) => {

        const target = m.quoted?.sender || m.mentionedJid?.[0] || m.sender

        const jid = (id) => {
            if (!id) return null
            if (typeof id !== 'string') return null
            if (!id.includes('@s.whatsapp.net')) return null
            return id
        }

        const user = jid(target)
        if (!user) return m.reply('❌ Usuario inválido.')

        const msg = text || m.quoted?.text
        if (!msg) {
            return m.reply('💬 Uso:\n.fakechat texto o responde a un mensaje')
        }

        try {

            const pushName = m.pushName || 'Usuario'

            const fake = `💬 *WhatsApp Chat Fake*

👤 ${pushName}
📱 ${user.split('@')[0]}

──────────────────
${msg}
──────────────────
⏰ ${new Date().toLocaleString()}`

            await conn.sendMessage(m.chat, {
                text: fake,
                mentions: [user]
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error generando fakechat.')
        }
    }
}

export default fakechat
