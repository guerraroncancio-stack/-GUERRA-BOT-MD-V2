import fs from 'fs'
import { startSubBot } from '../lib/serbot.js'

const DB_PATH = './sessions/subbots.json'
const MAX_SUBBOTS = 2

// =========================
// 📦 STORAGE
// =========================
function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {}
    return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// =========================
// 🧠 NORMALIZER
// =========================
const normalize = (n) => String(n || '').replace(/\D/g, '').trim()

// =========================
// ⚡ ULTRA REGISTRY (O(1))
// =========================
global.clusterDB = global.clusterDB || loadDB()
global.clusterIndex = global.clusterIndex || new Map()
global.clusterSessions = global.clusterSessions || {}

// =========================
// 🔴 CLOSE SESSION
// =========================
function closeSession(number) {
    number = normalize(number)

    const session = global.clusterSessions[number]
    if (session?.sock) {
        try {
            session.sock.end()
        } catch {}
    }

    delete global.clusterSessions[number]
    global.clusterIndex.delete(number)
}

// =========================
// ♻️ RESTORE ENGINE (SILENT)
// =========================
export async function startClusterEngine(conn) {

    const db = global.clusterDB

    for (const user in db) {
        for (const raw of db[user]) {

            const number = normalize(raw)

            if (global.clusterIndex.has(number)) continue

            try {
                const session = await startSubBot(null, conn, number, {
                    isCode: false,
                    restart: true,
                    silent: true
                })

                if (session) {
                    global.clusterSessions[number] = session
                    global.clusterIndex.set(number, user)
                }

                console.log(`♻️ Cluster restored: ${number}`)

            } catch (e) {
                console.log(`❌ restore failed ${number}`, e)
            }
        }
    }
}

// =========================
// 🤖 COMMAND ENGINE
// =========================
const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {

            const user = m.sender
            const db = global.clusterDB

            if (!db[user]) db[user] = []

            const userBots = db[user].map(normalize)

            const args = (text || '').trim().split(' ')
            const cmd = args[0]?.toLowerCase()

            // =========================
            // 📌 PANEL
            // =========================
            if (!text) {
                return conn.sendMessage(m.chat, {
                    image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                    caption:
`╭─〔 ⚡ CLUSTER ULTRA ENGINE 〕─⬣
│
│ 📌 .code <numero>
│ 📌 .code list
│ 📌 .code off
│ 📌 .code remove <numero>
│
│ 🧠 Activos:
│ ${userBots.length}/${MAX_SUBBOTS}
│
╰──────────────⬣`
                }, { quoted: m })
            }

            // =========================
            // 📌 LIST
            // =========================
            if (cmd === 'list') {

                let txt = `╭─〔 ⚡ CLUSTER ACTIVE 〕─⬣\n│\n`

                for (const u in db) {
                    txt += `│ 👤 ${u}\n│ 🤖 ${(db[u] || []).length}\n│\n`
                }

                txt += `╰──────────────⬣`

                return m.reply(txt)
            }

            // =========================
            // 📌 OFF (KILL ALL)
            // =========================
            if (cmd === 'off') {

                for (const num of userBots) {
                    closeSession(num)
                }

                db[user] = []
                saveDB(db)

                return m.reply(`╭─〔 🔴 CLUSTER OFF 〕─⬣
│
│ ❌ Sesiones cerradas
│ 🧠 Cluster detenido
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE (O(1) FIX)
            // =========================
            if (cmd === 'remove') {

                const number = normalize(args.slice(1).join(''))

                if (!number) {
                    return m.reply('❌ Número inválido')
                }

                const index = db[user].map(normalize).indexOf(number)

                if (index === -1) {
                    return m.reply('❌ Subbot no existe')
                }

                closeSession(number)

                db[user].splice(index, 1)
                saveDB(db)

                return m.reply(`🗑 Removed: ${number}`)
            }

            // =========================
            // 📌 CREATE NODE
            // =========================
            const number = normalize(text)

            if (!number || number.length < 10) {
                return m.reply('❌ Número inválido')
            }

            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply('❌ Límite alcanzado')
            }

            if (global.clusterIndex.has(number)) {
                return m.reply('❌ Ya existe en cluster')
            }

            await m.reply('⚡ Starting node...')

            const session = await startSubBot(m, conn, number, {
                isCode: true,
                restart: true,
                silent: true
            })

            if (session) {
                global.clusterSessions[number] = session
                global.clusterIndex.set(number, user)
            }

            db[user].push(number)
            saveDB(db)

            return conn.sendMessage(m.chat, {
                image: { url: 'https://api.dix.lat/media2/1777431085383.jpg' },
                caption:
`╭─〔 ⚡ NODE ONLINE 〕─⬣
│
│ 📱 ${number}
│ 🟢 ACTIVE
│ 🧠 CLUSTER OK
│
│ 📊 ${userBots.length + 1}/${MAX_SUBBOTS}
│
╰──────────────⬣`
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            return m.reply('❌ Cluster Ultra Engine error')
        }
    }
}

export default codeCommand
