import fs from 'fs'
import { startSubBot } from '../lib/serbot.js'

const DB_PATH = './sessions/subbots.json'

// =========================
// 📦 DB
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
// 🔥 GLOBAL STATE (CLUSTER CORE)
// =========================
global.clusterSessions = global.clusterSessions || {}
global.clusterIndex = global.clusterIndex || new Map()

// 🔴 KILL REGISTER (CLAVE REAL)
global.killedSubbots = global.killedSubbots || new Set()

// =========================
// 💀 HARD KILL SESSION (ULTRA)
// =========================
function killSession(number) {

    number = normalize(number)

    // 🔴 marcar como muerto (EVITA RESTART)
    global.killedSubbots.add(number)

    const session = global.clusterSessions[number]

    if (session?.sock) {
        try {
            // 🔴 eliminar listeners
            session.sock.ev?.removeAllListeners?.()

            // 🔴 cerrar websocket real
            session.sock.ws?.close?.()

            // 🔴 cerrar socket
            session.sock.end?.()
        } catch (e) {
            console.log('kill error:', e)
        }
    }

    delete global.clusterSessions[number]
    global.clusterIndex.delete(number)
}

// =========================
// ♻️ RESTORE ENGINE (respeta kill list)
// =========================
export async function startClusterEngine(conn) {

    const db = loadDB()

    for (const user in db) {
        for (const raw of db[user]) {

            const number = normalize(raw)

            // 🔴 SI ESTÁ MATADO NO REVIENE
            if (global.killedSubbots.has(number)) continue

            if (global.clusterSessions[number]) continue

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

                console.log(`♻️ restored: ${number}`)

            } catch (e) {
                console.log(`❌ restore fail ${number}`, e)
            }
        }
    }
}

// =========================
// 🤖 COMMAND ENGINE
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

            const userBots = db[user].map(normalize)

            const args = (text || '').trim().split(' ')
            const cmd = args[0]?.toLowerCase()

            // =========================
            // 📌 OFF (FULL KILL)
            // =========================
            if (cmd === 'off') {

                for (const num of userBots) {
                    killSession(num)
                }

                db[user] = []
                saveDB(db)

                return m.reply(`╭─〔 💀 KILL ENGINE ULTRA 〕─⬣
│
│ 🔴 Todos los subbots fueron ELIMINADOS
│ 💀 Sesiones destruidas
│ 🧠 No volverán a reconectarse
│
╰──────────────⬣`)
            }

            // =========================
            // 📌 REMOVE (SOFT KILL)
            // =========================
            if (cmd === 'remove') {

                const number = normalize(args.slice(1).join(''))

                const index = db[user].map(normalize).indexOf(number)

                if (index === -1) {
                    return m.reply('❌ No existe')
                }

                killSession(number)

                db[user].splice(index, 1)
                saveDB(db)

                return m.reply(`🗑 KILLED: ${number}`)
            }

            // =========================
            // 📌 CREATE
            // =========================
            const number = normalize(text)

            if (!number || number.length < 10) {
                return m.reply('❌ Número inválido')
            }

            if (userBots.length >= MAX_SUBBOTS) {
                return m.reply('❌ Límite alcanzado')
            }

            // 🔴 SI ESTÁ MUERTO, LO REVIVE SOLO SI SE CREA DE NUEVO
            global.killedSubbots.delete(number)

            await m.reply('⚡ Starting subbot...')

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

            return m.reply(`╭─〔 ⚡ ONLINE 〕─⬣
│
│ 📱 ${number}
│ 🟢 ACTIVE
│
╰──────────────⬣`)

        } catch (e) {
            console.error(e)
            return m.reply('❌ Kill Engine error')
        }
    }
}

export default codeCommand
