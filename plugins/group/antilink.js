const antilink = {
    name: 'antilink',
    alias: ['antilink', 'anti-link'],
    category: 'group',

    run: async (m, { conn }) => {

        try {

            if (!m.isGroup) return;
            if (!m.text) return;

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            // OFF
            if (!chat.antiLink) return;

            const linkRegex = /chat\.whatsapp\.com/i;
            const channelRegex = /whatsapp\.com\/channel/i;

            if (!linkRegex.test(m.text) && !channelRegex.test(m.text)) return;

            const user = m.sender;

            // permisos
            const isAdmin = m.isAdmin || false;
            const isOwner = m.isOwner || false;

            if (isAdmin || isOwner) return;

            // bot admin check
            if (!m.isBotAdmin) {
                return conn.reply(m.chat, '⚠️ Necesito ser admin para anti-link', m);
            }

            // warns
            chat.warn = chat.warn || {};
            chat.warn[user] = (chat.warn[user] || 0) + 1;

            const warns = chat.warn[user];

            await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

            if (warns < 2) {
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *ANTILINK*\n\n@${user.split('@')[0]} advertencia ${warns}/2`,
                    mentions: [user]
                });
            }

            chat.warn[user] = 0;

            await conn.sendMessage(m.chat, {
                text: `🚫 *EXPULSADO*\n\n@${user.split('@')[0]} fue eliminado por anti-link`,
                mentions: [user]
            });

            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

        } catch (e) {
            console.log('[ANTILINK ERROR]', e);
        }

    }
};

export default antilink;
