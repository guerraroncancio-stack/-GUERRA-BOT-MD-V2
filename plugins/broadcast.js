const broadcast = {
    name: 'broadcast',
    alias: ['bc', 'anunciar', 'global'],
    category: 'owner',

    run: async (m, { conn, text, isROwner }) => {

        if (!isROwner) {
            return m.reply('❌ Solo el owner puede usar broadcast.')
        }

        const mensaje = text || m.quoted?.text

        if (!mensaje) {
            return m.reply('⚠️ Usa:\n.broadcast texto\nO responde a un mensaje')
        }

        await m.react('📣')

        try {

            // 📌 obtener chats
            const chats = Object.keys(await conn.chats || {})

            let enviados = 0

            for (const id of chats) {
                try {

                    await conn.sendMessage(id, {
                        text: `📣 *BROADCAST*\n\n${mensaje}`
                    })

                    enviados++

                    // pequeño delay anti flood
                    await new Promise(r => setTimeout(r, 800))

                } catch (e) {
                    continue
                }
            }

            await m.react('✅')

            return m.reply(`📣 Broadcast enviado a ${enviados} chats.`)

        } catch (e) {

            console.log(e)
            await m.react('❌')
            return m.reply('❌ Error al enviar broadcast.')
        }
    }
}

export default broadcast
