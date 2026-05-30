const enable = {
    name: 'enable',
    alias: ['welcome', 'bv', 'detect', 'autosticker', 'antisub', 'antilink', 'antistatus', 'modoadmin', 'nsfw'],
    category: 'config',
    admin: true,
    group: true,

    run: async function (m, { command }) {

        global.db ||= {}
        global.db.data ||= {}
        global.db.data.chats ||= {}

        global.db.data.chats[m.chat] ||= {}

        const chat = global.db.data.chats[m.chat]

        const featureMap = {
            'welcome': 'welcome',
            'bv': 'welcome',
            'detect': 'detect',
            'antisub': 'antisub',
            'antilink': 'antiLink',
            'nsfw': 'nsfw',
            'antistatus': 'antiStatus',
            'modoadmin': 'modoadmin',
            'autosticker': 'autoStickers',
        }

        const type = (command || '').toLowerCase()

        // =========================
        // 📌 MENU
        // =========================
        if (type === 'enable' || !featureMap[type]) {

            let menu = `❯❯ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗧𝗜𝗢𝗡\n\n`

            const options = [
                { name: 'Bienvenida', key: 'welcome' },
                { name: 'Detección', key: 'detect' },
                { name: 'Anti-Links', key: 'antiLink' },
                { name: 'Modo Admin', key: 'modoadmin' },
                { name: 'Nsfw', key: 'nsfw' },
                { name: 'Auto-Stickers', key: 'autoStickers' }
            ]

            for (const opt of options) {
                const status = chat[opt.key] ? '✅ ACTIVADO' : '❌ DESACTIVADO'
                menu += `❖ ${opt.name}: ${status}\n`
            }

            return m.reply(menu)
        }

        // =========================
        // 📌 TOGGLE
        // =========================
        const key = featureMap[type]

        chat[key] = !chat[key]

        const status = chat[key]
            ? 'ACTIVADO'
            : 'DESACTIVADO'

        return m.reply(
            `✔ ${type.toUpperCase()} ${status}`
        )
    }
}

export default enable
