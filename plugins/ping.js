const ping = {
    name: 'ping',
    alias: ['p', 'latencia'],
    category: 'tools',

    run: async (m, { conn }) => {

        try {

            const start = m.messageTimestamp || Date.now()

            const sent = await conn.sendMessage(m.chat, {
                text: '🏓 midiendo ping...'
            }, { quoted: m })

            const end = Date.now()

            // diferencia entre mensaje del usuario y respuesta del bot
            const latency = end - (start * 1000)

            let estado = '🟢 Excelente'
            if (latency > 500) estado = '🟡 Normal'
            if (latency > 1000) estado = '🔴 Alto'

            await conn.sendMessage(m.chat, {
                text: `🏓 *PING DEL USUARIO*

⚡ Tu latencia: ${latency} ms
📡 Estado: ${estado}
👤 Usuario: @${m.sender.split('@')[0]}

⏱️ Hora: ${new Date().toLocaleTimeString()}`,
                mentions: [m.sender]
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error al calcular ping.')
        }
    }
}

export default ping
