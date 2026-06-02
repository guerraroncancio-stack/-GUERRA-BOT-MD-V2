const runtime = {
    name: 'runtime',
    alias: ['uptime', 'rtime', 'tiempo'],
    category: 'info',

    run: async (m, { conn }) => {

        const format = (seconds) => {
            const h = Math.floor(seconds / 3600)
            const m = Math.floor((seconds % 3600) / 60)
            const s = Math.floor(seconds % 60)
            return `${h}h ${m}m ${s}s`
        }

        const uptime = process.uptime()

        const msg = `
⏱️ *RUNTIME DEL BOT*

🤖 Estado: Activo
🟢 Tiempo encendido: ${format(uptime)}
⚙️ Node: ${process.version}

📡 Bot funcionando correctamente
`

        await conn.sendMessage(m.chat, {
            text: msg.trim()
        }, { quoted: m })
    }
}

export default runtime
