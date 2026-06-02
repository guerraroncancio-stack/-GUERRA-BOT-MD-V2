const modoadmin = {
    name: 'modoadmin',
    alias: ['modoadmin', 'adminbot'],
    category: 'group',

    run: async (m, { conn, args, isOwner, isROwner }) => {

        try {

            if (!m.isGroup) return;

            global.db.data = global.db.data || {};
            global.db.data.chats = global.db.data.chats || {};

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            const option = (args[0] || '').toLowerCase();

            // =========================
            // ON
            // =========================
            if (option === 'on') {

                if (!isOwner && !isROwner) {
                    return m.reply('❌ Solo el owner puede activar modoadmin');
                }

                chat.modoadmin = true;

                return conn.sendMessage(m.chat, {
                    text: `🟢 *MODO ADMIN ACTIVADO*\n\n👮 Solo administradores y owner pueden usar el bot.`
                }, { quoted: m });
            }

            // =========================
            // OFF
            // =========================
            if (option === 'off') {

                if (!isOwner && !isROwner) {
                    return m.reply('❌ Solo el owner puede desactivar modoadmin');
                }

                chat.modoadmin = false;

                return conn.sendMessage(m.chat, {
                    text: `🔴 *MODO ADMIN DESACTIVADO*\n\n🤖 Todos los usuarios pueden usar el bot nuevamente.`
                }, { quoted: m });
            }

            // =========================
            // STATUS
            // =========================

            const status = chat.modoadmin ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';

            return conn.sendMessage(m.chat, {
                text: `⚙️ *MODO ADMIN STATUS*\n\n${status}\n\n📌 Uso:\n.modoadmin on\n.modoadmin off`
            }, { quoted: m });

        } catch (e) {
            console.log('[MODADMIN ERROR]', e);
            m.reply('❌ Error en modoadmin');
        }
    }
};

export default modoadmin;
