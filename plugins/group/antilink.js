const antilink = {
    name: 'antilink',
    alias: ['antilink', 'anti-link'],
    category: 'group',

    run: async (m, { conn, args, isAdmin, isOwner, isROwner }) => {

        try {

            if (!m.isGroup) return;

            global.db.data = global.db.data || {};
            global.db.data.chats = global.db.data.chats || {};

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            chat.antiLink = chat.antiLink || false;
            chat.warn = chat.warn || {};

            const option = (args[0] || '').toLowerCase();

            // =========================
            // ON
            // =========================
            if (option === 'on') {

                if (!isOwner && !isROwner) {
                    return m.reply('❌ Solo el owner puede activar anti-link');
                }

                chat.antiLink = true;

                return conn.sendMessage(m.chat, {
                    text:
`🟢 *ANTILINK ACTIVADO*

🚫 Links externos serán sancionados
⚠️ Sistema de advertencias activo
📊 3 advertencias = expulsión`
                }, { quoted: m });
            }

            // =========================
            // OFF
            // =========================
            if (option === 'off') {

                if (!isOwner && !isROwner) {
                    return m.reply('❌ Solo el owner puede desactivar anti-link');
                }

                chat.antiLink = false;
                chat.warn = {};

                return conn.sendMessage(m.chat, {
                    text:
`🔴 *ANTILINK DESACTIVADO*

🤖 Sistema deshabilitado
📉 Advertencias reiniciadas`
                }, { quoted: m });
            }

            // =========================
            // PANEL
            // =========================

            const status = chat.antiLink ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';

            return conn.sendMessage(m.chat, {
                text:
`⚙️ *PANEL ANTILINK*

📌 Estado: ${status}

📊 Sistema de sanciones:
- 1 advertencia → warning
- 2 advertencias → alerta fuerte
- 3 advertencias → expulsión

🔧 Comandos:
.antilink on
.antilink off`
            }, { quoted: m });

        } catch (e) {
            console.log('[ANTILINK ERROR]', e);
        }

    },

    // =========================
    // DETECTOR (SANCIÓN REAL)
    // =========================

    before: async (m, { conn, isAdmin, isOwner, isROwner, isBotAdmin }) => {

        try {

            if (!m.isGroup) return;
            if (!m.text) return;
            if (m.isBaileys || m.fromMe) return;

            const chat = global.db.data.chats[m.chat] =
                global.db.data.chats[m.chat] || {};

            if (!chat.antiLink) return;

            const linkRegex = /chat\.whatsapp\.com|whatsapp\.com\/channel/i;

            if (!linkRegex.test(m.text)) return;

            const user = m.sender;

            // =========================
            // PROTECCIONES
            // =========================

            if (isAdmin || isOwner || isROwner) return;

            if (!isBotAdmin) {
                return conn.reply(m.chat, '⚠️ Necesito ser admin para anti-link', m);
            }

            chat.warn = chat.warn || {};
            chat.warn[user] = (chat.warn[user] || 0) + 1;

            const warns = chat.warn[user];

            // borrar mensaje
            await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

            // =========================
            // WARNING 1
            // =========================

            if (warns === 1) {
                return conn.sendMessage(m.chat, {
                    text:
`⚠️ *ANTILINK WARNING*

@${user.split('@')[0]} no está permitido enviar links

📊 Advertencia: 1/3`,
                    mentions: [user]
                });
            }

            // =========================
            // WARNING 2
            // =========================

            if (warns === 2) {
                return conn.sendMessage(m.chat, {
                    text:
`⚠️ *ANTILINK ALERTA*

@${user.split('@')[0]} segunda advertencia

🚨 Última oportunidad`,
                    mentions: [user]
                });
            }

            // =========================
            // KICK (3)
            // =========================

            chat.warn[user] = 0;

            await conn.sendMessage(m.chat, {
                text:
`🚫 *EXPULSADO*

@${user.split('@')[0]} fue eliminado por anti-link`,
                mentions: [user]
            });

            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

        } catch (e) {
            console.log('[ANTILINK ERROR]', e);
        }
    }
};

export default antilink;
