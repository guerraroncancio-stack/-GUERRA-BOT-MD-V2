global.botMode = global.botMode || {
    public: true,
    antiporn: false,
    antispam: false,
    autosticker: false,
    welcome: false
}

const mode = {
    name: 'mode',
    alias: ['modo', 'settings'],
    category: 'owner',

    run: async (m, { conn, args, isROwner }) => {

        if (!isROwner) {
            return m.reply('❌ Solo el owner puede usar este comando.')
        }

        const action = (args[0] || '').toLowerCase()
        const value = (args[1] || '').toLowerCase()

        // =========================
        // SHOW MODES
        // =========================
        if (!action) {
            return m.reply(`
⚙️ *BOT MODE SYSTEM*

📡 PUBLIC: ${global.botMode.public}
🚫 ANTISPAM: ${global.botMode.antispam}
🔞 ANTIPORN: ${global.botMode.antiporn}
🎨 AUTOSTICKER: ${global.botMode.autosticker}
👋 WELCOME: ${global.botMode.welcome}

📌 Uso:
.mode public on/off
.mode antispam on/off
.mode autosticker on/off
`)
        }

        // =========================
        // VALID VALUE
        // =========================
        if (!['on', 'off'].includes(value)) {
            return m.reply('⚠️ Usa: on / off')
        }

        const state = value === 'on'

        // =========================
        // SWITCH MODES
        // =========================
        switch (action) {

            case 'public':
                global.botMode.public = state
                break

            case 'antispam':
                global.botMode.antispam = state
                break

            case 'antiporn':
                global.botMode.antiporn = state
                break

            case 'autosticker':
                global.botMode.autosticker = state
                break

            case 'welcome':
                global.botMode.welcome = state
                break

            default:
                return m.reply('❌ Modo no válido.')
        }

        return m.reply(`✅ Modo ${action} cambiado a ${value.toUpperCase()}`)
    }
}

export default mode
