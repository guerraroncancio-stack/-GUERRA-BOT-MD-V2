const enable = {
    name: 'enable',
    alias: ['welcome', 'bv', 'detect', 'autosticker', 'antisub', 'antilink', 'antistatus', 'modoadmin', 'nsfw'],
    category: 'config',
    admin: true,
    group: true,

    run: async function (m, { conn, command, chat }) {

        const type = (command || '').toLowerCase();

        chat = chat || {};

        // 🔥 FUNCIONES REALES (EJECUTORES)
        const featureActions = {
            welcome: async (state) => {
                chat.welcome = state;
            },

            detect: async (state) => {
                chat.detect = state;
            },

            antiLink: async (state) => {
                chat.antiLink = state;

                if (state) {
                    global.antiLinkGroups = global.antiLinkGroups || new Set();
                    global.antiLinkGroups.add(m.chat);
                } else {
                    global.antiLinkGroups?.delete(m.chat);
                }
            },

            antiStatus: async (state) => {
                chat.antiStatus = state;
            },

            antisub: async (state) => {
                chat.antisub = state;
            },

            autoStickers: async (state) => {
                chat.autoStickers = state;
            },

            nsfw: async (state) => {
                chat.nsfw = state;
            },

            modoadmin: async (state) => {
                chat.modoadmin = state;
            }
        };

        const featureMap = {
            welcome: 'welcome',
            bv: 'welcome',
            detect: 'detect',
            antisub: 'antisub',
            antilink: 'antiLink',
            nsfw: 'nsfw',
            antistatus: 'antiStatus',
            modoadmin: 'modoadmin',
            autosticker: 'autoStickers',
        };

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

        const key = featureMap[type];
        if (!key) return;

        const newState = !(chat?.[key] ?? false);

        // 🔥 EJECUCIÓN REAL DE LA FUNCIÓN
        const action = featureActions[key];

        if (action) {
            await action(newState);
        } else {
            chat[key] = newState;
        }

        // 🔥 GUARDADO EN DB (SI EXISTE)
        if (global.Chat?.findOneAndUpdate) {
            await global.Chat.findOneAndUpdate(
                { id: m.chat },
                {
                    $setOnInsert: { id: m.chat },
                    $set: { [key]: newState }
                },
                { upsert: true, new: true }
            );
        }

        const statusText = newState ? 'ᴀᴄᴛɪᴠᴀᴅᴏ' : 'ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ';

        return m.reply(`> ʟᴀ ғᴜɴᴄɪᴏɴ *${type.toUpperCase()}* sᴇ ʜᴀ ${statusText}.`);
    }
};

export default enable;
