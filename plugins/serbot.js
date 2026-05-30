import fs from 'fs'
import { startSubBot } from '../lib/serbot.js'

const DB_PATH = './sessions/subbots.json'

// =========================
// 📦 STORAGE
// =========================
function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {}
    return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// =========================
// 🔥 CLUSTER REGISTRY
// =========================
global.subbotCluster = global.subbotCluster || {}

// =========================
// 🔴 CLOSE SESSION
// =========================
function closeSession(number) {
    try {
        const session = global.subbotCluster[number]
        if (session?.sock) {
            session.sock.end()
        }
        delete global.subbotCluster[number]
    } catch (e) {
        console.log('Cluster close error:', e)
    }
}

// =========================
// ♻️ SILENT RESTORE ENGINE
// =========================
export async function startClusterEngine(conn) {
    const db = loadDB()

    for (const user in db) {
        for (const number of db[user]) {

            if (global.subbotCluster[number]) continue

            try {
                const session = await startSubBot(null, conn, number, {
                    isCode: false,
                    restart: true,
                    silent: true // 🔥 MODO OCULTO
                })

                if (session) {
                    global.subbotCluster[number] = session
                }

                console.log(`♻️ Cluster restored: ${number}`)

            } catch (e) {
                console.log(`❌ Failed restore ${number}`, e)
            }
        }
    }
}

// =========================
// 🤖 SUBBOT ENGINE
// =========================
const MAX_SUBBOTS = 2

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            const db = loadDB()
            const user = m.sender

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
`╭─〔 ⚡ CLUSTER ENGINE PRO 〕─⬣
│
│ 📌 COMANDOS:
│ .code <numero>
│ .code list
│ .code off
│ .code remove <numero>
│
│ 🧠 Cluster:
│ 🟢 Activos: ${userBots.length}/${MAX_SUBBOTS}
│
╰──────────────⬣`
                }, { quoted: m })
            }

            // =========================
            // 📌 LIST
            // =========================
            if (cmd === 'list') {

                const users = Object.keys(db)

                let txt = `╭─〔 ⚡ CLUSTER ACTIVE 〕─⬣\n│\n`

                for (const u of users) {
                    txt += `│ 👤 ${u}\n`
                    txt += `│ 🤖 ${db[u].length}\n│\n`
                }

                txt += `╰──────────────⬣`

                return m.reply(txt)
            }

            // =========================
            // 📌 OFF (KILL ALL)
            // =========================
            if (cmd === 'off') {

                for (let num of userBots) {
                    closeSession(num)
                }

                db[user] = []
                saveDB(db)

                return m.reply(`╭─〔 🔴 CLUSTER STOPPED 〕─⬣
│
│ ❌ Todas las sesiones cerradas
│ 🧠 Cluster detenido
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE SINGLE
            // =========================
            if (cmd === 'remove') {

                const number = args.slice(1).join('').replace(/\D/g, '')

                if (!number) {
                    return m.reply('❌ Número inválido')
                }

                const index = userBots.indexOf(number)

                if (index === -1) {
                    return m.reply('❌ No existe')
                }

                closeSession(number)

                userBots.splice(index, 1)
                db[user] = userBots
                saveDB(db)

                return m.reply(`🗑 Cluster removed: ${number}`)
            }

            // =========================
            // 📌 CREATE (CLUSTER NODE)
            // =========================
            const number = text.replace(/\D/g, '')

            if (!number || number.length < 10) {
                return m.reply('❌ Número inválido')
            }

            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply('❌ Límite alcanzado')
            }

            await m.reply('⚡ Iniciando cluster node...')

            const session = await startSubBot(m, conn, number, {
                isCode: true,
                restart: true,
                silent: true // 🔥 NO MENSAJE DE INICIO
            })

            if (session) {
                global.subbotCluster[number] = session
            }

            if (!userBots.includes(number)) {
                userBots.push(number)
                db[user] = userBots
                saveDB(db)
            }

            return conn.sendMessage(m.chat, {
                image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                caption:
`╭─〔 ⚡ CLUSTER NODE ONLINE 〕─⬣
│
│ 📱 ${number}
│ 🟢 Estado: activo
│ 🧠 Cluster conectado
│
│ 📊 ${userBots.length}/${MAX_SUBBOTS}
│
╰──────────────⬣`
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            return m.reply('❌ Cluster Engine error')
        }
    }
}

export default codeCommand
