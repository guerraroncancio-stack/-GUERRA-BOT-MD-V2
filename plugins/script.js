import os from 'os'
import process from 'process'

const script = {
    name: 'script',
    alias: ['info', 'botinfo', 'status'],
    category: 'info',

    run: async (m, { conn }) => {

        const uptime = process.uptime()
        const formatTime = (sec) => {
            const h = Math.floor(sec / 3600)
            const m = Math.floor((sec % 3600) / 60)
            const s = Math.floor(sec % 60)
            return `${h}h ${m}m ${s}s`
        }

        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0)
        const ramFree = (os.freemem() / 1024 / 1024).toFixed(0)

        const info = `
🤖 *INFORMACIÓN DEL BOT*

⏱️ Uptime: ${formatTime(uptime)}
💾 RAM total: ${ramTotal} MB
📉 RAM libre: ${ramFree} MB
🖥️ Plataforma: ${os.platform()}
⚙️ CPU: ${os.cpus()[0].model}

📦 Node: ${process.version}

📡 Estado: Activo
`

        await conn.sendMessage(m.chat, {
            text: info.trim()
        }, { quoted: m })
    }
}

export default script
