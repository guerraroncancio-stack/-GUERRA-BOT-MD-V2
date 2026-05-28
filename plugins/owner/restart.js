import { exec } from 'child_process'

const restartCommand = {

    name: 'restart',

    alias: [
        'reiniciar',
        'reboot'
    ],

    category: 'owner',

    run: async (m, {
        conn,
        isROwner
    }) => {

        if (!isROwner) return

        const ui = `
╭─〔 🔄 REINICIO DEL SISTEMA 〕─╮
│
│ ⚙️ Estado: Reiniciando bot
│ 🚀 Método: Soft Restart
│ 📡 Servidor: Activo
│ ⏳ Tiempo: 2 segundos
│
╰──────────────────────╯

> GUERRA BOT MD volverá automáticamente
`

        try {

            await conn.sendMessage(
                m.chat,
                {
                    text: ui
                },
                {
                    quoted: m
                }
            )

            await m.react('⚙️')

            // =====================================
            // 🔥 RESTART SIN APAGAR VPS
            // =====================================

            setTimeout(() => {

                console.log(
                    '\n🔄 Reiniciando GUERRA BOT...\n'
                )

                // PM2
                if (process.env.pm_id) {

                    exec(
                        `pm2 restart ${process.env.pm_id}`
                    )

                }

                // PTERODACTYL / NODEMON
                else {

                    process.exit(1)

                }

            }, 2000)

        } catch (e) {

            console.log(e)

            return conn.sendMessage(
                m.chat,
                {
                    text:
`❌ ERROR AL REINICIAR

⚠️ ${e.message}`
                },
                {
                    quoted: m
                }
            )

        }

    }

}

export default restartCommand
