const modoadmin = {
    name: 'modoadmin',
    alias: ['modoadmin', 'adminbot'],
    category: 'group',

    run: async (m, { conn, isAdmin, isOwner, isROwner }) => {

        try {

            if (!m.isGroup) return;

            global.db.data = global.db.data || {};
            global.db.data.chats = global.db.data.chats || {};

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            if (!chat.modoadmin) return;

            const allowed = isAdmin || isOwner || isROwner;

            if (!allowed) return true; // bloquea en middleware

            return false;

        } catch (e) {
            console.log('[MODADMIN ERROR]', e);
            return false;
        }
    }
};

export default modoadmin;
