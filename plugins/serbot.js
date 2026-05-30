import { startSubBot } from '../lib/serbot.js'

const MAX_SUBBOTS = 2

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            global.subbotUsers = global.subbotUsers || {}

            const user = m.sender
            const db = global.subbotUsers

            const args = (text || '').trim().split(' ')
            const cmd = args[0]?.toLowerCase()

            const userBots = db[user] || []

            // =========================
            // 📌 PANEL
            // =========================
            if (!text) {
                return conn.sendMessage(m.chat, {
                    image: { url: 'https://i.imgur.com/5kQnL6X.jpeg' },
                    caption:
`╭─〔 🤖 SUBBOT SYSTEM PRO 〕─⬣
│
│ 📌 COMANDOS:
│ .code <numero>
│ .code list
│ .code off
│ .code remove <numero>
│
│ 📊 Estado:
│ 👤 Activos: ${userBots.length}/${MAX_SUBBOTS}
│
╰──────────────⬣`
                }, { quoted: m })
            }

            // =========================
            // 📌 LIST
            // =========================
            if (cmd === 'list') {

                const users = Object.keys(db)

                if (!users.length) {
                    return m.reply(`╭─〔 🤖 SUBBOTS 〕─⬣
│
│ ❌ No hay subbots activos
│
╰──────────────⬣`)
                }

                let txt = `╭─〔 🤖 SUBBOTS ACTIVOS 〕─⬣\n│\n`

                for (const u of users) {
                    txt += `│ 👤 ${u}\n`
                    txt += `│ 🤖 ${db[u].length}\n│\n`
                }

                txt += `╰──────────────⬣`

                return m.reply(txt)
            }

            // =========================
            // 📌 OFF (USER RESET)
            // =========================
            if (cmd === 'off') {

                if (!userBots.length) {
                    return m.reply(`❌ No tienes subbots activos`)
                }

                db[user] = []

                return m.reply(`╭─〔 🛑 SUBBOT OFF 〕─⬣
│
│ ❌ Todos tus subbots fueron eliminados
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE INDIVIDUAL
            // =========================
            if (cmd === 'remove') {

                const number = args[1]?.replace(/\D/g, '')

                if (!number) {
                    return m.reply(`❌ Número inválido`)
                }

                const index = userBots.indexOf(number)

                if (index === -1) {
                    return m.reply(`❌ Ese subbot no existe`)
                }

                userBots.splice(index, 1)
                db[user] = userBots

                return m.reply(`╭─〔 🗑 SUBBOT REMOVED 〕─⬣
│
│ 📱 ${number}
│ ❌ Eliminado correctamente
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 CREATE SUBBOT
            // =========================

            const number = cmd.replace(/\D/g, '')

            if (!number || number.length < 10) {
                return m.reply(`❌ Número inválido`)
            }

            // LIMIT CONTROL
            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply(`╭─〔 ⚠️ LÍMITE ALCANZADO 〕─⬣
│
│ ❌ Máximo ${MAX_SUBBOTS} subbots permitidos
│ 📊 Ya tienes: ${userBots.length}
│
╰──────────────⬣`)
            }

            await m.reply('⏳ Generando subbot...')

            const code = await startSubBot(m, conn, number, {
                isCode: true,
                caption: '🔑 Código generado'
            })

            if (!db[user]) db[user] = []
            if (!db[user].includes(number)) db[user].push(number)

            return conn.sendMessage(m.chat, {
                image: { url: 'https://i.imgur.com/5kQnL6X.jpeg' },
                caption:
`╭─〔 🤖 SUBBOT ACTIVE 〕─⬣
│
│ 📱 Número:
│ ${number}
│
│ 🔑 Código:
│ ${code}
│
│ 👤 Owner:
│ ${user}
│
│ 📊 Estado:
│ 🟢 Activo
│
│ 👥 Total:
│ ${db[user].length}/${MAX_SUBBOTS}
│
│ ⚙️ Comandos:
│ .code list
│ .code remove ${number}
│ .code off
│
╰──────────────⬣`
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            return m.reply('❌ Error en SubBot System Pro')
        }
    }
}

export default codeCommand
