import os from 'os'
import process from 'process'

const dashboard = {
    name: 'dashboard',
    alias: ['panel', 'status', 'bot'],
    category: 'info',

    run: async (m, { conn }) => {

        const uptime = process.uptime()

        const format = (s) => {
            const h = Math.floor(s / 3600)
            const m = Math.floor((s % 3600) / 60)
            const s2 = Math.floor(s % 60)
            return `${h}h ${m}m ${s2}s`
        }

        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0)
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0)
        const usedMem = totalMem - freeMem

        const cpu = os.cpus()[0].model

        const usersCache = global.cacheUsers ? global.cacheUsers.size : 0
        const activeChats = Object.keys(await conn.chats || {}).length

        const msg = `
📊 *DASHBOARD DEL BOT*

⏱️ Uptime: ${format(uptime)}
⚡ Node: ${process.version}

💾 RAM total: ${totalMem} MB
📉 RAM libre: ${freeMem} MB
📊 RAM usada: ${usedMem} MB

🖥️ CPU: ${cpu}

👤 Usuarios cache: ${usersCache}
💬 Chats activos: ${activeChats}

📡 Estado: 🟢 Online
`

        await conn.sendMessage(m.chat, {
            text: msg.trim()
        }, { quoted: m })
    }
}

export default dashboard
