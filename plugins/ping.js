import speed from 'performance-now'
import os from 'os'

const ping = {
    name: 'ping',
    alias: ['p', 'pong'],
    category: 'info',

    run: async (m, { conn }) => {

        const start = speed()

        const latency = speed() - start

        const ram = (
            process.memoryUsage().heapUsed /
            1024 /
            1024
        ).toFixed(2)

        const uptime = process.uptime()

        const h = Math.floor(uptime / 3600)
        const min = Math.floor((uptime % 3600) / 60)
        const sec = Math.floor(uptime % 60)

        const cpu = os.loadavg()[0].toFixed(2)

        let estado = '🟢 Óptimo'

        if (latency > 200) estado = '🟡 Estable'
        if (latency > 500) estado = '🟠 Lento'
        if (latency > 1000) estado = '🔴 Saturado'

        const texto = `
╭━━〔 ⚡ SISTEMA BOT 〕━━⬣
┃
┃ 🏓 Latencia
┃ ➜ ${latency.toFixed(0)} ms
┃
┃ 📶 Conexión
┃ ➜ ${estado}
┃
┃ 🧠 RAM
┃ ➜ ${ram} MB
┃
┃ ⚙️ CPU Load
┃ ➜ ${cpu}
┃
┃ ⏱️ Uptime
┃ ➜ ${h}h ${min}m ${sec}s
┃
┃ 🤖 Motor
┃ ➜ Node ${process.version}
┃
╰━━━━━━━━━━━━━━⬣
`

        await conn.sendMessage(
            m.chat,
            {
                text: texto
            },
            {
                quoted: m
            }
        )
    }
}

export default ping
