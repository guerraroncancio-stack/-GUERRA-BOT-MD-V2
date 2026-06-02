const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i

const antilink = {
    name: 'antilink',
    category: 'group',

    before: async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {

        try {

            if (!m.isGroup) return;
            if (!m.text) return;
            if (m.isBaileys || m.fromMe) return;

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            if (!chat.antiLink) return;

            const user = m.sender;

            const isGroupLink = linkRegex.test(m.text);
            const isChannelLink = channelLinkRegex.test(m.text);

            if (!isGroupLink && !isChannelLink) return;

            if (isAdmin || isOwner || isROwner) return;

            if (!isBotAdmin) {
                return conn.reply(m.chat, '⚠️ Necesito ser admin para anti-link', m);
            }

            chat.warn = chat.warn || {};
            chat.warn[user] = chat.warn[user] || 0;

            try {
                const code = await conn.groupInviteCode(m.chat);
                const myLink = `https://chat.whatsapp.com/${code}`;
                if (m.text.includes(myLink)) return;
            } catch {}

            await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

            chat.warn[user]++;

            if (chat.warn[user] < 2) {
                return conn.sendMessage(m.chat, {
                    text: `⚠️ *ANTILINK*\n\n@${user.split('@')[0]} advertencia ${chat.warn[user]}/2`,
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
}

export default antilink;
