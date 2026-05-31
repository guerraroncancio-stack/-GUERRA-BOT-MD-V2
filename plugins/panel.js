const panelCommand = {
    name: 'panel',
    alias: ['inicio', 'dashboard', 'guerrabot'],
    category: 'main',

    run: async (m, { conn }) => {
        try {

            const botones = [
                { id: '.menu', text: '⚔️ Menú Principal' },
                { id: '.ping', text: '🚀 Velocidad' },
                { id: '.owner', text: '👑 Owner' },
                { id: '.serbot', text: '🤖 Ser SubBot' },
                { id: '.grupos', text: '📢 Comunidad' }
            ]

            await conn.sendButtonMessage(
                m.chat,
                `╭━━━〔 ⚔️ GUERRA BOT ⚔️ 〕━━━⬣
┃
┃ 🎮 Centro de control oficial
┃ 🤖 Sistema operativo activo
┃ ⚡ Comandos rápidos disponibles
┃ 🛡️ Protección habilitada
┃
╰━━━━━━━━━━━━━━━━⬣

> Selecciona una opción del panel interactivo.`,
                botones,
                {
                    title: '⚔️ GUERRA BOT',
                    footer: 'Battle System • Version 2.0',
                    quoted: m,
                    image: {
                        url: 'https://i.imgur.com/2L6YkQb.jpeg'
                    }
                }
            )

        } catch (err) {
            console.error(err)

            m.reply(
`╭━━━〔 ❌ ERROR 〕━━━⬣
┃
┃ No fue posible abrir
┃ el panel interactivo.
┃
╰━━━━━━━━━━━━━━⬣`
            )
        }
    }
}

export default panelCommand
