export async function modoadmin(m, conn, opts = {}) {

    try {

        if (!m.isGroup) return;

        const {
            isAdmin,
            isBotAdmin,
            isOwner,
            isROwner
        } = opts;

        // =========================
        // DB SAFE INIT
        // =========================

        global.db.data = global.db.data || {};
        global.db.data.chats = global.db.data.chats || {};

        const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};

        const adminMode = chat.modoadmin === true;

        if (!adminMode) return;

        // =========================
        // PERMISOS GLOBALES
        // =========================

        if (isOwner || isROwner) return;
        if (isAdmin) return;

        if (!isBotAdmin) return;

        // =========================
        // FILTRO INTELIGENTE
        // =========================

        const text = m.text || ''

        // no bloquear comandos
        if (text.startsWith(global.prefix || '.')) return;

        // =========================
        // ACCIÓN
        // =========================

        await conn.sendMessage(m.chat, {
            text: `🚫 *MODO ADMIN ACTIVADO*\n\nSolo administradores pueden escribir en este grupo.`
        }, { quoted: m })

        // borrar mensaje si es posible
        try {
            await conn.sendMessage(m.chat, {
                delete: m.key
            })
        } catch {}

    } catch (e) {
        console.log('[MODADMIN ERROR]', e)
    }
}
