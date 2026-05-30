import fs from 'fs'
import { startSubBot } from '../lib/serbot.js'

const MAX_SUBBOTS = 2
const DB_PATH = './sessions/subbots.json'

// =========================
// 📦 DB HELPERS
// =========================
function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {}
    return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// =========================
// 🔁 AUTO RESTORE (NO CIERRA SESIONES)
// =========================
export async function restoreSubbots(conn) {
    const db = loadDB()

    for (const user in db) {
        for (const number of db[user]) {
            console.log(`♻️ Restaurando subbot: ${number}`)
            await startSubBot(null, conn, number, {
                isCode: false,
                restart: true
            })
        }
    }
}

// =========================
// 🤖 COMMAND
// =========================
const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            const db = loadDB()
            const user = m.sender

            if (!db[user]) db[user] = []

            const args = (text || '').trim().split(' ')
            const cmd = args[0]?.toLowerCase()

            const userBots = db[user]

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
            // 📌 OFF
            // =========================
            if (cmd === 'off') {

                db[user] = []
                saveDB(db)

                return m.reply(`╭─〔 🛑 SUBBOT OFF 〕─⬣
│
│ ❌ Todos tus subbots fueron eliminados
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE
            // =========================
            if (cmd === 'remove') {

                const number = args.slice(1).join('').replace(/\D/g, '')

                const index = userBots.indexOf(number)

                if (index === -1) {
                    return m.reply('❌ Subbot no encontrado')
                }

                userBots.splice(index, 1)
                db[user] = userBots
                saveDB(db)

                return m.reply(`🗑 Subbot eliminado: ${number}`)
            }

            // =========================
            // 📌 CREATE
            // =========================
            const number = text.replace(/\D/g, '')

            if (!number || number.length < 10) {
                return m.reply('❌ Número inválido')
            }

            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply(`❌ Límite alcanzado (${MAX_SUBBOTS})`)
            }

            await m.reply('⏳ Generando subbot...')

            const code = await startSubBot(m, conn, number, {
                isCode: true,
                caption: '🔑 Código generado'
            })

            if (!code) {
                return m.reply('❌ Error generando código')
            }

            if (!userBots.includes(number)) {
                userBots.push(number)
                db[user] = userBots
                saveDB(db)
            }

            return conn.sendMessage(m.chat, {
                image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                caption:
`╭─〔 🤖 SUBBOT ACTIVE 〕─⬣
│
│ 📱 ${number}
│ 🔑 ${code}
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
            return m.reply('❌ Error Subbot System')
        }
    }
}

export default codeCommand
