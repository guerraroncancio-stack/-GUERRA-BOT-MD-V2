import { startSubBot } from '../lib/serbot.js'

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            // =========================
            // 📌 LISTA DE SUBBOTS
            // =========================
            if (text === 'list' || text === 'lista') {

                let subbots = global.subbotUsers || {}
                let owners = Object.keys(subbots)

                if (!owners.length) {
                    return m.reply(`╭─〔 🤖 SUBBOTS ACTIVOS 〕─⬣
│
│ ❌ No hay subbots activos
│
╰──────────────⬣`)
                }

                let txt = `╭─〔 🤖 SUBBOTS ACTIVOS 〕─⬣\n│\n`

                for (let owner of owners) {
                    let bots = subbots[owner] || []

                    txt += `│ 👤 Owner: ${owner}\n`
                    txt += `│ 🤖 Vinculados: ${bots.length}\n`

                    txt += `│\n`
                }

                txt += `╰──────────────⬣`

                return m.reply(txt)
            }

            // =========================
            // 📌 CREAR SUBBOT
            // =========================

            let number = text.replace(/\D/g, '')

            if (!number) {
                return m.reply(
`╭─〔 📱 VINCULAR SUBBOT 〕─⬣
│
│ Uso:
│ .code 573001234567
│ .code list
│
╰──────────────⬣`
                )
            }

            await m.reply('⏳ Generando código...')

            const code = await startSubBot(
                m,
                conn,
                number,
                {
                    isCode: true,
                    caption: '🔑 Código generado'
                }
            )

            if (code) {

                const owner = m.sender

                await conn.sendMessage(m.chat, {
                    image: {
                        url: 'https://api.dix.lat/media2/1777431085383.jpg'
                    },
                    caption:
`╭─〔 🤖 SUBBOT ACTIVO 〕─⬣
│
│ 📱 Número:
│ ${number}
│
│ 🔑 Código:
│ ${code}
│
│ 👥 Vinculados:
│ ${global.subbotUsers?.[owner]?.length || 0}/2
│
╰──────────────⬣`
                }, { quoted: m })

            }

        } catch (e) {
            console.error(e)
            await m.reply('❌ Error al procesar subbot.')
        }
    }
}

export default codeCommand
