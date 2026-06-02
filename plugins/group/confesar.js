global.crushDB = global.crushDB || {}

const confesar = {
    name: 'confesar',
    alias: ['crush', 'confesion', 'love'],
    category: 'social',

    run: async (m, { conn, text, usedPrefix }) => {

        try {

            const sender = m.sender
            const mentioned = m.mentionedJid?.[0]

            if (!mentioned) {
                return m.reply(
                    `💌 Uso:\n` +
                    `${usedPrefix}confesar @usuario mensaje`
                )
            }

            const msg = text.replace(/@\d+/g, '').trim()

            if (!msg) {
                return m.reply('⚠️ Escribe tu confesión.')
            }

            // =========================
            // CRUSH SAVE
            // =========================

            const id = `${sender}_${mentioned}`

            if (global.crushDB[id]) {
                return m.reply('⏳ Ya enviaste una confesión a esta persona.')
            }

            global.crushDB[id] = {
                from: sender,
                to: mentioned,
                msg,
                status: 'pending',
                time: Date.now()
            }

            // =========================
            // MESSAGE
            // =========================

            const textMsg =
`💌 *NUEVA CONFESIÓN CRUSH*

❤️ Alguien tiene sentimientos por ti...

💬 Mensaje:
"${msg}"

⚡ Reacciona:
❤️ = Aceptar
💔 = Rechazar`

            const sent = await conn.sendMessage(m.chat, {
                text: textMsg,
                mentions: [mentioned]
            }, { quoted: m })

            global.crushDB[id].msgId = sent.key.id

        } catch (e) {
            console.log(e)
            m.reply('❌ Error en confesión.')
        }
    },

    // =========================
    // REACTIONS SYSTEM
    // =========================

    async before(m, { conn }) {

        try {

            if (!m.message?.reactionMessage) return

            const reaction = m.message.reactionMessage
            const msgId = reaction.key.id
            const emoji = reaction.text
            const user = m.sender

            const entry = Object.values(global.crushDB)
                .find(v => v.msgId === msgId)

            if (!entry) return

            if (user !== entry.to) return

            const from = entry.from
            const to = entry.to

            delete global.crushDB[`${from}_${to}`]

            if (emoji === '❤️') {

                await conn.sendMessage(m.chat, {
                    text:
`💞 *CRUSH ACEPTADO*

❤️ @${to.split('@')[0]} aceptó la confesión de @${from.split('@')[0]}`
                    ,
                    mentions: [from, to]
                })

            } else if (emoji === '💔') {

                await conn.sendMessage(m.chat, {
                    text:
`💔 *CRUSH RECHAZADO*

@${to.split('@')[0]} rechazó la confesión.`,
                    mentions: [from, to]
                })
            }

        } catch (e) {
            console.log('[CRUSH ERROR]', e)
        }
    }
}

export default confesar
