/* =========================================
   ⚔️ GUERRA BOT — CORE HANDLER
========================================= */

const core = {

    name: 'core',

    run: async (m, {
        conn,
        command,
        args,
        text,
        usedPrefix,
        isROwner
    }) => {

        switch (command) {

            /* =========================
               🏓 PING
            ========================= */

            case 'ping':
            case 'p':
            case 'speed': {

                const start = Date.now()

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`🏓 Pong!!

⚡ Speed:
${Date.now() - start}ms`
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               👑 OWNER
            ========================= */

            case 'owner':
            case 'creador': {

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`👑 OWNER OFICIAL

⚔️ Kevin Guerra
📱 wa.me/573102286030`
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               ⏱️ RUNTIME
            ========================= */

            case 'runtime':
            case 'uptime': {

                const runtime = process.uptime()

                const days =
                Math.floor(runtime / 86400)

                const hours =
                Math.floor(runtime / 3600) % 24

                const minutes =
                Math.floor(runtime / 60) % 60

                const seconds =
                Math.floor(runtime) % 60

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`⏱️ Runtime

${days}D ${hours}H ${minutes}M ${seconds}S`
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🤖 BOT INFO
            ========================= */

            case 'bot':
            case 'info': {

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`⚔️ ${global.BOT.name}

👑 Owner:
${global.BOT.owner}

📦 Version:
${global.BOT.version}

🌐 Mode:
${global.BOT.mode}

⌨️ Prefix:
${global.BOT.prefix}`
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🔄 RESTART
            ========================= */

            case 'restart':
            case 'reiniciar': {

                if (!isROwner) return true

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
'♻️ Reiniciando bot...'
                    },
                    {
                        quoted: m
                    }
                )

                process.exit(0)

            }

            /* =========================
               📴 SELF MODE
            ========================= */

            case 'self': {

                if (!isROwner) return true

                global.BOT.mode = 'SELF'

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
'🔒 Modo SELF activado.'
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🌐 PUBLIC MODE
            ========================= */

            case 'public': {

                if (!isROwner) return true

                global.BOT.mode = 'PUBLIC'

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
'🌍 Modo PUBLIC activado.'
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               📋 MENU
            ========================= */

            case 'menu':
            case 'help': {

                const menu =
`
╔══════════════════╗
║ ⚔️ GUERRA BOT ⚔️
╚══════════════════╝

👑 OWNER
• ${usedPrefix}owner

🏓 INFO
• ${usedPrefix}ping
• ${usedPrefix}runtime
• ${usedPrefix}bot

⚙️ SYSTEM
• ${usedPrefix}self
• ${usedPrefix}public
• ${usedPrefix}restart
`

                await conn.sendMessage(
                    m.chat,
                    {
                        text: menu
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

        }

        return false

    }

}

export default core
