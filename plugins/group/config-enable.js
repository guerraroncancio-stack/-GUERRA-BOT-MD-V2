const enable = {
    name: 'enable',
    alias: ['welcome', 'bv', 'detect', 'autosticker', 'antisub', 'antilink', 'antistatus', 'modoadmin', 'nsfw'],
    category: 'config',
    admin: true,
    group: true,

    run: async function (m, { conn, command, chat }) {

        const featureMap = {
            welcome: 'welcome',
            bv: 'welcome',
            detect: 'detect',
            gacha: 'gacha',
            antisub: 'antisub',
            antilink: 'antiLink',
            nsfw: 'nsfw',
            antistatus: 'antiStatus',
            modoadmin: 'modoadmin',
            autosticker: 'autoStickers',
        };

        const type = (command || '').toLowerCase();

        // 🔥 asegurar chat SIEMPRE
        if (!chat) chat = {};

        // 🔥 MENU
        if (type === 'enable' || !featureMap[type]) {

            let menu = `❯❯ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗧𝗜𝗢𝗡\n\n`;

            const options = [
                { name: 'Bienvenida', key: 'welcome' },
                { name: 'Detección', key: 'detect' },
                { name: 'Anti-Links', key: 'antiLink' },
                { name: 'Modo Admin', key: 'modoadmin' },
                { name: 'Nsfw', key: 'nsfw' },
                { name: 'Auto-Stickers', key: 'autoStickers' }
            ];

            for (const opt of options) {
                const status = (chat?.[opt.key] ?? false)
                    ? '✅ ᴀᴄᴛɪᴠᴀᴅᴏ'
                    : '❌ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ';

                menu += `❖ *${opt.name}:* ${status}\n`;
            }

            return m.reply(menu.trim());
        }

        const dbKey = featureMap[type];
        if (!dbKey) return;

        // 🔥 toggle seguro
        const newValue = !(chat?.[dbKey] ?? false);

        // 🔥 guardar en Mongo SOLO si existe modelo
        const ChatModel = global.Chat;

        if (ChatModel && typeof ChatModel.findOneAndUpdate === 'function') {
            await ChatModel.findOneAndUpdate(
                { id: m.chat },
                {
                    $setOnInsert: { id: m.chat },
                    $set: { [dbKey]: newValue }
                },
                { upsert: true, new: true }
            );
        }

        // 🔥 fallback memoria runtime
        chat[dbKey] = newValue;

        const statusText = newValue ? 'ᴀᴄᴛɪᴠᴀᴅᴏ' : 'ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ';

        return m.reply(`> ʟᴀ ғᴜɴᴄɪᴏɴ *${type.toUpperCase()}* sᴇ ʜᴀ ${statusText}.`);
    }
};

export default enable;
