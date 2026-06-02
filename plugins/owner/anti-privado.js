const antiPrivateCommand = {

    name: 'antiprivado',

    alias: [
        'antipriv',
        'privado',
        'listblock',
        'bloqueados',
        'unblock',
        'desbloquear'
    ],

    category: 'owner',

    // =========================================
    // 🔥 BEFORE
    // =========================================

    async before(m, { conn, isOwner, isROwner }) {

        try {

            if (!m.message) return false;
            if (m.isGroup) return false;
            if (m.fromMe) return false;
            if (m.key?.fromMe) return false;
            if (m.chat === 'status@broadcast') return false;

            // OWNER SI PUEDE
            if (isOwner || isROwner) return false;

            // =========================================
            // DATABASE
            // =========================================

            global.db.data = global.db.data || {};
            global.db.data.settings = global.db.data.settings || {};

            const botNumber =
                conn.user?.jid || conn.user?.id;

            if (!global.db.data.settings[botNumber]) {

                global.db.data.settings[botNumber] = {
                    antiPrivate: true,
                    blockedUsers: []
                };

            }

            const settings =
                global.db.data.settings[botNumber];

            // APAGADO
            if (!settings.antiPrivate)
                return false;

            // =========================================
            // GUARDAR BLOQUEADO
            // =========================================

            if (
                !settings.blockedUsers.includes(
                    m.sender
                )
            ) {

                settings.blockedUsers.push(
                    m.sender
                );

            }

            // =========================================
            // MENSAJE
            // =========================================

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

            // ESPERA
            await new Promise(resolve =>
                setTimeout(resolve, 1500)
            );

            // BLOQUEAR
            await conn.updateBlockStatus(
                m.sender,
                'block'
            );

            // BORRAR CHAT
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

    // =========================================
    // 🔥 RUN
    // =========================================

    async run(m, { conn, args, command }) {

        try {

            global.db.data = global.db.data || {};
            global.db.data.settings = global.db.data.settings || {};

            const botNumber =
                conn.user?.jid || conn.user?.id;

            if (!global.db.data.settings[botNumber]) {

                global.db.data.settings[botNumber] = {
                    antiPrivate: true,
                    blockedUsers: []
                };

            }

            const settings =
                global.db.data.settings[botNumber];

            // =========================================
            // ON / OFF
            // =========================================

            if (
                command === 'antiprivado' ||
                command === 'antipriv' ||
                command === 'privado'
            ) {

                const option =
                    (args[0] || '').toLowerCase();

                // ON
                if (option === 'on') {

                    settings.antiPrivate = true;

                    return conn.sendMessage(
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

                }

                // OFF
                if (option === 'off') {

                    settings.antiPrivate = false;

                    return conn.sendMessage(
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

                }

                // USO
                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ Uso:
┃ ➥ .antiprivado on
┃ ➥ .antiprivado off
┃ ➥ .bloqueados
┃ ➥ .desbloquear numero
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                    },
                    { quoted: m }
                );

            }

            // =========================================
            // 📋 LISTA BLOQUEADOS
            // =========================================

            if (
                command === 'listblock' ||
                command === 'bloqueados'
            ) {

                const blocked =
                    settings.blockedUsers || [];

                if (!blocked.length) {

                    return conn.sendMessage(
                        m.chat,
                        {
                            text:
`╭━━〔 🚫 BLOQUEADOS 🚫 〕━━⬣
┃
┃ No hay usuarios
┃ bloqueados.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                        },
                        { quoted: m }
                    );

                }

                let txt =
`╭━━〔 🚫 LISTA BLOQUEADOS 🚫 〕━━⬣\n┃\n`;

                blocked.forEach((user, i) => {

                    txt +=
`┃ ${i + 1}. wa.me/${user.split('@')[0]}\n`;

                });

                txt +=
`┃\n╰━━━━━━━━━━━━━━━━━━⬣`;

                return conn.sendMessage(
                    m.chat,
                    {
                        text: txt
                    },
                    { quoted: m }
                );

            }

            // =========================================
            // 🔓 DESBLOQUEAR
            // =========================================

            if (
                command === 'unblock' ||
                command === 'desbloquear'
            ) {

                let number =
                    args[0] ||
                    (
                        m.quoted?.sender
                        ? m.quoted.sender.split('@')[0]
                        : null
                    );

                if (!number) {

                    return conn.sendMessage(
                        m.chat,
                        {
                            text:
`╭━━〔 🔓 DESBLOQUEAR 🔓 〕━━⬣
┃
┃ Uso:
┃ ➥ .desbloquear 573xx
┃
┃ O responde un mensaje.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                        },
                        { quoted: m }
                    );

                }

                number =
                    number.replace(/[^0-9]/g, '');

                const jid =
                    number + '@s.whatsapp.net';

                // DESBLOQUEAR
                await conn.updateBlockStatus(
                    jid,
                    'unblock'
                );

                // ELIMINAR DE LISTA
                settings.blockedUsers =
                    settings.blockedUsers.filter(
                        v => v !== jid
                    );

                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 🔓 DESBLOQUEADO 🔓 〕━━⬣
┃
┃ ✅ Usuario desbloqueado:
┃ ➥ wa.me/${number}
┃
┃ ⚠️ Si vuelve a escribir
┃ será bloqueado otra vez.
┃
╰━━━━━━━━━━━━━━━━━━⬣`
                    },
                    { quoted: m }
                );

            }

        } catch (e) {

            console.log(
                '[ ANTIPRIVADO ERROR ]',
                e
            );

        }

    }

};

export default antiPrivateCommand;
