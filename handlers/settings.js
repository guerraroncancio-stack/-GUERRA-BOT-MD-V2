/* =========================================
   ⚙️ SETTINGS HANDLER — GUERRA BOT
   Powered by Kevin Guerra
========================================= */

global.dbSettings = global.dbSettings || {}

const settingsHandler = async (m, {
    conn,
    command,
    args,
    isAdmin,
    isROwner
}) => {

    if (!m.isGroup) {
        return conn.reply(
            m.chat,
            '❌ Este comando solo funciona en grupos.',
            m
        )
    }

    if (!isAdmin && !isROwner) {
        return conn.reply(
            m.chat,
            '❌ Solo administradores.',
            m
        )
    }

    if (!global.dbSettings[m.chat]) {

        global.dbSettings[m.chat] = {
            antiLink: false,
            welcome: false,
            antiSpam: false,
            nsfw: false,
            autoSticker: false
        }

    }

    const chat =
    global.dbSettings[m.chat]

    switch (command) {

        /* =========================================
           🔗 ANTILINK
        ========================================= */

        case 'antilink': {

            if (!args[0]) {
                return conn.reply(
                    m.chat,
                    '⚠️ Usa:\n.antilink on\n.antilink off',
                    m
                )
            }

            if (args[0] === 'on') {

                chat.antiLink = true

                return conn.reply(
                    m.chat,
                    '✅ AntiLink activado.',
                    m
                )

            }

            if (args[0] === 'off') {

                chat.antiLink = false

                return conn.reply(
                    m.chat,
                    '✅ AntiLink desactivado.',
                    m
                )

            }

        }
        break

        /* =========================================
           👋 WELCOME
        ========================================= */

        case 'welcome': {

            if (!args[0]) {
                return conn.reply(
                    m.chat,
                    '⚠️ Usa:\n.welcome on\n.welcome off',
                    m
                )
            }

            if (args[0] === 'on') {

                chat.welcome = true

                return conn.reply(
                    m.chat,
                    '✅ Welcome activado.',
                    m
                )

            }

            if (args[0] === 'off') {

                chat.welcome = false

                return conn.reply(
                    m.chat,
                    '✅ Welcome desactivado.',
                    m
                )

            }

        }
        break

        /* =========================================
           🚫 ANTISPAM
        ========================================= */

        case 'antispam': {

            if (!args[0]) {
                return conn.reply(
                    m.chat,
                    '⚠️ Usa:\n.antispam on\n.antispam off',
                    m
                )
            }

            if (args[0] === 'on') {

                chat.antiSpam = true

                return conn.reply(
                    m.chat,
                    '✅ AntiSpam activado.',
                    m
                )

            }

            if (args[0] === 'off') {

                chat.antiSpam = false

                return conn.reply(
                    m.chat,
                    '✅ AntiSpam desactivado.',
                    m
                )

            }

        }
        break

        /* =========================================
           🔞 NSFW
        ========================================= */

        case 'nsfw': {

            if (!args[0]) {
                return conn.reply(
                    m.chat,
                    '⚠️ Usa:\n.nsfw on\n.nsfw off',
                    m
                )
            }

            if (args[0] === 'on') {

                chat.nsfw = true

                return conn.reply(
                    m.chat,
                    '✅ NSFW activado.',
                    m
                )

            }

            if (args[0] === 'off') {

                chat.nsfw = false

                return conn.reply(
                    m.chat,
                    '✅ NSFW desactivado.',
                    m
                )

            }

        }
        break

        /* =========================================
           🖼️ AUTOSTICKER
        ========================================= */

        case 'autosticker': {

            if (!args[0]) {
                return conn.reply(
                    m.chat,
                    '⚠️ Usa:\n.autosticker on\n.autosticker off',
                    m
                )
            }

            if (args[0] === 'on') {

                chat.autoSticker = true

                return conn.reply(
                    m.chat,
                    '✅ AutoSticker activado.',
                    m
                )

            }

            if (args[0] === 'off') {

                chat.autoSticker = false

                return conn.reply(
                    m.chat,
                    '✅ AutoSticker desactivado.',
                    m
                )

            }

        }
        break

        /* =========================================
           📊 SETTINGS STATUS
        ========================================= */

        case 'settings':
        case 'config': {

            const teks = `
╭━━〔 ⚙️ SETTINGS ⚙️ 〕━━⬣

🔗 AntiLink:
${chat.antiLink ? '✅ ON' : '❌ OFF'}

👋 Welcome:
${chat.welcome ? '✅ ON' : '❌ OFF'}

🚫 AntiSpam:
${chat.antiSpam ? '✅ ON' : '❌ OFF'}

🔞 NSFW:
${chat.nsfw ? '✅ ON' : '❌ OFF'}

🖼️ AutoSticker:
${chat.autoSticker ? '✅ ON' : '❌ OFF'}

╰━━━━━━━━━━━━━━━━⬣
`.trim()

            conn.reply(
                m.chat,
                teks,
                m
            )

        }
        break
    }

}

settingsHandler.command = [
    'antilink',
    'welcome',
    'antispam',
    'nsfw',
    'autosticker',
    'settings',
    'config'
]

export default settingsHandler
