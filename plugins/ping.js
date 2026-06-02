const ping = {
    name: 'ping',
    alias: ['p', 'latencia', 'speed'],
    category: 'tools',

    run: async (m, { conn }) => {

        const start = Date.now()

        try {

            const sent = await conn.sendMessage(m.chat, {
                text: '🏓 Calculando ping...'
            }, { quoted: m })

            const end = Date.now()

            const latency = end - start

            let status = '🟢 Excelente'
            if (latency > 500) status = '🟡 Normal'
            if (latency > 1000) status = '🔴 Lento'

            await conn.sendMessage(m.chat, {
                text: `🏓 *PING DEL BOT*

⚡ Latencia: ${latency} ms
📡 Estado: ${status}
🤖 Bot: Activo

⏱️ Hora: ${new Date().toLocaleTimeString()}`,
                edit: sent.key
            })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error midiendo ping.')
        }
    }
}

export default ping
