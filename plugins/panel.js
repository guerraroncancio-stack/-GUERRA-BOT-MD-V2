const panelCommand = {
    name: 'panel',
    alias: ['inicio', 'dashboard', 'guerrabot'],
    category: 'main',

    run: async (m, { conn }) => {
        try {

            await conn.sendPreviewMessage(
                m.chat,
`⚔️ GUERRA BOT ⚔️

🎮 Centro de control oficial
🤖 Sistema operativo activo
⚡ Comandos rápidos disponibles
🛡️ Protección habilitada

╭─〔 COMANDOS RÁPIDOS 〕─⬣
│
│ ⚔️ .menu
│ 🚀 .ping
│ 👑 .owner
│ 🤖 .serbot
│ 📢 .grupos
│
╰──────────────⬣`,
                {
                    type: 3,
                    ratio: 'landscape',
                    url: 'https://whatsapp.com/channel/',
                    thumbnail: 'https://i.imgur.com/2L6YkQb.jpeg',
                    title: '⚔️ GUERRA BOT',
                    body: 'Battle System • Version 2.0',
                    quoted: m
                }
            )

        } catch (err) {
            console.error(err)

            m.reply(
`╭━━━〔 ❌ ERROR 〕━━━⬣
┃
┃ No fue posible abrir
┃ el panel.
┃
╰━━━━━━━━━━━━━━⬣`
            )
        }
    }
}

export default panelCommand
