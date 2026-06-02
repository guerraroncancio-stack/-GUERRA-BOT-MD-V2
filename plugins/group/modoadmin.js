const modoadmin = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {

    try {

        if (!m.isGroup) return;

        global.db.data = global.db.data || {};
        global.db.data.chats = global.db.data.chats || {};

        const chat = global.db.data.chats[m.chat] =
            global.db.data.chats[m.chat] || {};

        if (!chat.modoadmin) return;

        if (isOwner || isROwner) return;
        if (isAdmin) return;
        if (!isBotAdmin) return;

        const text = m.text || '';

        // no bloquear comandos
        if (text.startsWith(global.prefix || '.')) return;

        await conn.sendMessage(m.chat, {
            text: `🚫 *MODO ADMIN ACTIVO*\n\nSolo administradores pueden escribir aquí.`
        }, { quoted: m });

        await conn.sendMessage(m.chat, {
            delete: m.key
        }).catch(() => {});

    } catch (e) {
        console.log('[MODADMIN ERROR]', e);
    }

};

export default modoadmin;
