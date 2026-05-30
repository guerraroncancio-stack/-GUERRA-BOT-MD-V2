import { startSubBot } from '../lib/serbot.js'

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text, command }) => {
        try {

            let subbots = global.subbotUsers || (global.subbotUsers = {})

            // =========================
            // 📌 DESACTIVAR SUBBOT
            // =========================
            if (command === 'subbot' && text === 'off') {

                let user = m.sender

                if (!subbots[user] || !subbots[user].length) {
                    return m.reply(`╭─〔 🤖 SUBBOT 〕─⬣
│
│ ❌ No tienes subbots activos
│
╰──────────────⬣`)
                }

                delete subbots[user]

                return m.reply(`╭─〔 🤖 SUBBOT OFF 〕─⬣
│
│ 🛑 Subbot desactivado correctamente
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 LISTA DE SUBBOTS
            // =========================
            if (text === 'list' || text === 'lista') {

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
                    txt += `│ 🤖 Activos: ${bots.length}\n`
                    txt += `│\n`
                }

                txt += `╰──────────────⬣`

                return m.reply(txt)
            }

            // =========================
            // 📌 PANEL DE AYUDA
            // =========================
            if (!text) {
                return m.reply(
`╭─〔 🤖 SUBBOT PANEL 〕─⬣
│
│ 📌 Comandos:
│ .code 573001234567
│ .code list
│ .subbot off
│
│ ⚙️ Control:
│ Activar → .code <numero>
│ Desactivar → .subbot off
│
╰──────────────⬣`
                )
            }

            // =========================
            // 📌 CREAR SUBBOT
            // =========================

            let number = text.replace(/\D/g, '')

            if (!number) {
                return m.reply(`❌ Número inválido`)
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

                let owner = m.sender

                if (!subbots[owner]) subbots[owner] = []
                subbots[owner].push(number)

                await conn.sendMessage(m.chat, {
                    image: {
                        url: 'https://i.imgur.com/5kQnL6X.jpeg'
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
│ ⚙️ Comandos:
│ .code list
│ .subbot off
│
│ 👥 Vinculados:
│ ${subbots[owner].length}/2
│
╰──────────────⬣`
                }, { quoted: m })

            }

        } catch (e) {
            console.error(e)
            await m.reply('❌ Error en subbot system')
        }
    }
}

export default codeCommand
