export async function modoadmin(m, { conn, isAdmin, isOwner, isROwner }) {

    try {

        if (!m.isGroup) return false;

        global.db.data = global.db.data || {};
        global.db.data.chats = global.db.data.chats || {};

        const chat = global.db.data.chats[m.chat] =
            global.db.data.chats[m.chat] || {};

        // modo admin OFF
        if (!chat.modoadmin) return false;

        const senderIsAllowed =
            isAdmin || isOwner || isROwner;

        // ❌ si NO está permitido → bloquear comandos del bot
        if (!senderIsAllowed) {
            return true; // bloquea ejecución del bot en tu middleware
        }

        return false;

    } catch (e) {
        console.log('[MODADMIN ERROR]', e);
        return false;
    }
}
