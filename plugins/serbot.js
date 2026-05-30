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
// 🔥 GLOBAL STATE
// =========================
global.clusterSessions = global.clusterSessions || {}
global.clusterIndex = global.clusterIndex || new Map()
global.killedSubbots = global.killedSubbots || new Set()

// =========================
// 💣 DELETE SESSION FILES (CLAVE REAL)
// =========================
function deleteSessionFiles(number) {
    try {
        const path = `./sessions/subbot-${number}`

        if (fs.existsSync(path)) {
            fs.rmSync(path, { recursive: true, force: true })
        }
    } catch (e) {
        console.log('session delete error:', e)
    }
}

// =========================
// 💀 HARD KILL REAL
// =========================
function killSession(number) {

    number = normalize(number)

    // 🔴 BLOQUEA RESTART
    global.killedSubbots.add(number)

    const session = global.clusterSessions[number]

    if (session?.sock) {
        try {
            session.sock.ev?.removeAllListeners?.()
            session.sock.ws?.close?.()
            session.sock.end?.()
        } catch (e) {}
    }

    // 💣 BORRA ARCHIVOS DE SESIÓN (ESTO ES LO QUE TE FALTABA)
    deleteSessionFiles(number)

    delete global.clusterSessions[number]
    global.clusterIndex.delete(number)
}

// =========================
// ♻️ RESTORE ENGINE
// =========================
export async function startClusterEngine(conn) {

    const db = loadDB()

    for (const user in db) {
        for (const raw of db[user]) {

            const number = normalize(raw)

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

            } catch (e) {
                console.log('restore fail:', number)
            }
        }
    }
}

// =========================
// 🤖 COMMAND
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

                return m.reply(`💀 TODOS LOS SUBBOTS FUERON ELIMINADOS`)
            }

            // =========================
            // 📌 REMOVE
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

                return m.reply(`🗑 SUBBOT ELIMINADO: ${number}`)
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

            // 🔴 si estaba muerto, lo desbloquea SOLO si se recrea
            global.killedSubbots.delete(number)

            await m.reply('⚡ Iniciando subbot...')

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

            return m.reply(`🟢 SUBBOT ACTIVO: ${number}`)

        } catch (e) {
            console.error(e)
            return m.reply('❌ Error')
        }
    }
}

export default codeCommand
