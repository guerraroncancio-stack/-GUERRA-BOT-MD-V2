const antiPrivateCommand = {

    name: 'antiprivado',
    alias: ['antipriv', 'privado'],

    category: 'owner',

    async before(m, { conn, isOwner, isROwner }) {

        try {

            // =========================
            // IGNORAR
            // =========================

            if (!m.message) return false;
            if (m.isGroup) return false;
            if (m.fromMe) return false;
            if (m.key?.fromMe) return false;
            if (m.chat === 'status@broadcast') return false;

            // =========================
            // OWNER
            // =========================

            if (isOwner || isROwner) return false;

            // =========================
            // FIX DATABASE
            // =========================

            global.db.data = global.db.data || {};
            global.db.data.settings = global.db.data.settings || {};

            const botNumber =
                conn.user?.jid || conn.user?.id;

            if (!global.db.data.settings[botNumber]) {

                global.db.data.settings[botNumber] = {
                    antiPrivate: true
                };

            }

            const botSettings =
                global.db.data.settings[botNumber];

            // =========================
            // SISTEMA APAGADO
            // =========================

            if (!botSettings.antiPrivate)
                return false;

            // =========================
            // MENSAJE
            // =========================

            await conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ ❌ No puedes escribir
┃ al privado del bot.
┃
┃ 👑 Solo el owner
┃ tiene acceso.
┃
┃ 🚷 Serás bloqueado.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                { quoted: m }
            );

            // =========================
            // ESPERA
            // =========================

            await new Promise(resolve =>
                setTimeout(resolve, 1500)
            );

            // =========================
            // BLOQUEAR
            // =========================

            await conn.updateBlockStatus(
                m.sender,
                'block'
            );

            // =========================
            // BORRAR CHAT
            // =========================

            if (conn.chatModify) {

                await conn.chatModify(
                    {
                        delete: true,
                        lastMessages: []
                    },
                    m.chat
                ).catch(() => {});

            }

        } catch (e) {

            console.log(
                '[ ANTIPRIVADO ERROR ]',
                e
            );

        }

        return false;

    },

    async run(m, { conn, args }) {

        try {

            global.db.data = global.db.data || {};
            global.db.data.settings = global.db.data.settings || {};

            const botNumber =
                conn.user?.jid || conn.user?.id;

            if (!global.db.data.settings[botNumber]) {

                global.db.data.settings[botNumber] = {
                    antiPrivate: true
                };

            }

            const botSettings =
                global.db.data.settings[botNumber];

            const option =
                (args[0] || '').toLowerCase();

            // =========================
            // ON
            // =========================

            if (option === 'on') {

                botSettings.antiPrivate = true;

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ ✅ Sistema activado.
┃
┃ El bot bloqueará
┃ automáticamente
┃ los privados.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                    },
                    { quoted: m }
                );

                return;

            }

            // =========================
            // OFF
            // =========================

            if (option === 'off') {

                botSettings.antiPrivate = false;

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ ❌ Sistema desactivado.
┃
┃ El bot ya no
┃ bloqueará privados.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                    },
                    { quoted: m }
                );

                return;

            }

            // =========================
            // USO
            // =========================

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ Uso:
┃ ➥ .antiprivado on
┃ ➥ .antiprivado off
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                { quoted: m }
            );

        } catch (e) {

            console.log(e);

        }

    }

};

export default antiPrivateCommand;
