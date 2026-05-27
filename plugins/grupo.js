// =========================================
// 🔓 ABRIR / 🔒 CERRAR GRUPO PREMIUM
// Archivo: plugins/grupo-openclose.js
// =========================================

export default {

    name: 'grupo',

    alias: [
        'group',
        'gc'
    ],

    group: true,
    admin: true,
    botAdmin: true,

    async run(m, {
        conn,
        args
    }) {

        const action =
        (args[0] || '').toLowerCase()

        const banner =
        'https://cdn.dix.lat/me/3a1b5867-1ecb-40dc-acf8-250526ebad65.jpg'

        // =========================================
        // 🔓 ABRIR GRUPO
        // =========================================

        if (
            action === 'abrir' ||
            action === 'open'
        ) {

            await conn.groupSettingUpdate(
                m.chat,
                'not_announcement'
            )

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 🔓 GRUPO ABIERTO 🔓 〕━━⬣
┃ ⚔️ Ahora todos pueden hablar
┃ 👑 Acción ejecutada correctamente
┃ 🚀 Sistema: GUERRA BOT
╰━━━━━━━━━━━━━━━━━━⬣`,

                    contextInfo: {

                        mentionedJid: [m.sender],

                        externalAdReply: {

                            title: 'GUERRA BOT MD',

                            body: 'Sistema de Administración',

                            thumbnailUrl: banner,

                            sourceUrl:
                            'https://github.com',

                            mediaType: 1,

                            renderLargerThumbnail: true,

                            showAdAttribution: true

                        }

                    }

                },
                {
                    quoted: m
                }
            )

        }

        // =========================================
        // 🔒 CERRAR GRUPO
        // =========================================

        if (
            action === 'cerrar' ||
            action === 'close'
        ) {

            await conn.groupSettingUpdate(
                m.chat,
                'announcement'
            )

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 🔒 GRUPO CERRADO 🔒 〕━━⬣
┃ ⚠️ Solo admins pueden hablar
┃ 🛡️ Protección activada
┃ 🚀 Sistema: GUERRA BOT
╰━━━━━━━━━━━━━━━━━━⬣`,

                    contextInfo: {

                        mentionedJid: [m.sender],

                        externalAdReply: {

                            title: 'GUERRA BOT MD',

                            body: 'Sistema de Seguridad',

                            thumbnailUrl: banner,

                            sourceUrl:
                            'https://github.com',

                            mediaType: 1,

                            renderLargerThumbnail: true,

                            showAdAttribution: true

                        }

                    }

                },
                {
                    quoted: m
                }
            )

        }

        // =========================================
        // ❌ USO INCORRECTO
        // =========================================

        return conn.sendMessage(
            m.chat,
            {
                text:
`╭━━〔 ⚙️ USO DEL COMANDO ⚙️ 〕━━⬣
┃ 📌 .grupo abrir
┃ 📌 .grupo cerrar
╰━━━━━━━━━━━━━━━━━━⬣`,

                contextInfo: {

                    externalAdReply: {

                        title: 'GUERRA BOT MD',

                        body: 'Panel de Administración',

                        thumbnailUrl: banner,

                        sourceUrl:
                        'https://github.com',

                        mediaType: 1,

                        renderLargerThumbnail: true,

                        showAdAttribution: true

                    }

                }

            },
            {
                quoted: m
            }
        )

    }

}
