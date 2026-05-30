import { startSubBot } from '../lib/serbot.js'

const MAX_SUBBOTS = 2

global.subbotUsers = global.subbotUsers || {}
global.subbotSessions = global.subbotSessions || {}

// =========================
// 🔴 CLOSE SESSION REAL
// =========================
function closeSubbot(number) {
    try {
        const session = global.subbotSessions[number]

        if (session?.sock) {
            session.sock.end()
        }

        delete global.subbotSessions[number]
    } catch (e) {
        console.log('Error cerrando subbot:', e)
    }
}

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            const user = m.sender
            const db = global.subbotUsers

            if (!db[user]) db[user] = []

            const userBots = db[user]
            const args = (text || '').trim().split(' ')
            const cmd = args[0]?.toLowerCase()

            // =========================
            // 📌 PANEL
            // =========================
            if (!text) {
                return conn.sendMessage(m.chat, {
                    image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                    caption:
`╭─〔 🤖 SUBBOT SYSTEM PRO 〕─⬣
│
│ 📌 COMANDOS:
│ .code <numero>
│ .code list
│ .code off
│ .code remove <numero>
│
│ 📊 Activos:
│ ${userBots.length}/${MAX_SUBBOTS}
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
                    return m.reply(`❌ No hay subbots activos`)
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
            // 📌 OFF (CERRAR TODO)
            // =========================
            if (cmd === 'off') {

                if (!userBots.length) {
                    return m.reply(`❌ No tienes subbots activos`)
                }

                for (let num of userBots) {
                    closeSubbot(num)
                }

                db[user] = []

                return m.reply(`╭─〔 🛑 SUBBOT OFF 〕─⬣
│
│ ❌ Todos los subbots fueron cerrados
│ 🧠 Sesiones eliminadas
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE INDIVIDUAL
            // =========================
            if (cmd === 'remove') {

                const number = args.slice(1).join('').replace(/\D/g, '')

                if (!number) {
                    return m.reply(`❌ Número inválido`)
                }

                const index = userBots.indexOf(number)

                if (index === -1) {
                    return m.reply(`❌ Ese subbot no existe`)
                }

                // 🔴 cerrar sesión real
                closeSubbot(number)

                userBots.splice(index, 1)
                db[user] = userBots

                return m.reply(`╭─〔 🗑 SUBBOT REMOVED 〕─⬣
│
│ 📱 ${number}
│ 🛑 Sesión cerrada
│ ❌ Eliminado completamente
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 CREATE SUBBOT
            // =========================

            const number = text.replace(/\D/g, '')

            if (!number || number.length < 10) {
                return m.reply('❌ Número inválido')
            }

            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply(`❌ Límite alcanzado (${MAX_SUBBOTS})`)
            }

            await m.reply('⏳ Generando subbot...')

            const session = await startSubBot(m, conn, number, {
                isCode: true,
                caption: '🔑 Código generado'
            })

            // 🔴 guardar sesión real
            if (session) {
                global.subbotSessions[number] = session
            }

            if (!userBots.includes(number)) {
                userBots.push(number)
                db[user] = userBots
            }

            return conn.sendMessage(m.chat, {
                image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                caption:
`╭─〔 🤖 SUBBOT ACTIVE 〕─⬣
│
│ 📱 ${number}
│ 🔑 Código generado
│
│ 👤 Owner: ${user}
│ 📊 ${userBots.length}/${MAX_SUBBOTS}
│
│ ⚙️ .code list
│ ⚙️ .code remove ${number}
│ ⚙️ .code off
│
╰──────────────⬣`
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            return m.reply('❌ Error Subbot System Pro')
        }
    }
}

export default codeCommand
