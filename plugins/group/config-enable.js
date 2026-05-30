const enable = {
    name: 'enable',
    alias: ['welcome', 'bv', 'detect', 'autosticker', 'antisub', 'antilink', 'antistatus', 'modoadmin', 'nsfw'],
    category: 'config',
    admin: true,
    group: true,

    run: async function (m, { conn, command, chat, usedPrefix }) {

        try {

            // =========================
            // 🧠 SAFE CHAT INIT
            // =========================
            global.db ||= {}
            global.db.data ||= {}
            global.db.data.chats ||= {}

            global.db.data.chats[m.chat] ||= {}

            const data = global.db.data.chats[m.chat]

            // =========================
            // 🔁 FEATURE MAP
            // =========================
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

                    const status = data[opt.key] ? '✅ ᴀᴄᴛɪᴠᴀᴅᴏ' : '❌ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ'

                    menu += `❖ *${opt.name}:* ${status}\n`
                }

                return m.reply(menu.trim())
            }

            // =========================
            // 📌 FEATURE TOGGLE
            // =========================
            const dbKey = featureMap[type]

            if (!dbKey) return

            // 🔥 FIX SAFE BOOLEAN
            data[dbKey] = !data[dbKey]

            // =========================
            // 💾 MONGOOSE SUPPORT (SAFE)
            // =========================
            if (global.Chat?.findOneAndUpdate) {
                await global.Chat.findOneAndUpdate(
                    { id: m.chat },
                    { $set: { [dbKey]: data[dbKey] } },
                    { new: true }
                )
            }

            const statusText = data[dbKey]
                ? 'ᴀᴄᴛɪᴠᴀᴅᴏ'
                : 'ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ'

            return m.reply(
                `> ʟᴀ ғᴜɴᴄɪᴏɴ *${type.toUpperCase()}* sᴇ ʜᴀ ${statusText}.`
            )

        } catch (e) {
            console.log('[ ENABLE ERROR ]', e)
            return m.reply('❌ Error en configuración')
        }
    }
}

export default enable
