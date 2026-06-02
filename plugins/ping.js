import speed from 'performance-now'

const ping = {
    name: 'ping',
    alias: ['p', 'pong'],
    category: 'info',

    run: async (m, { conn }) => {

        const start = speed()

        const sent = await conn.sendMessage(m.chat, {
            text: '🏓 midiendo ping...'
        }, { quoted: m })

        const latency = speed() - start

        let estado = '🟢 bueno'
        if (latency > 300) estado = '🟡 normal'
        if (latency > 700) estado = '🔴 lento'

        await conn.sendMessage(m.chat, {
            text: `🏓 *PONG*

⚡ Ping: ${latency.toFixed(2)} ms
📡 Estado: ${estado}`,
            edit: sent.key
        })
    }
}

export default ping
