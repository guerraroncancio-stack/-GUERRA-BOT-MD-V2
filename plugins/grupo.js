// =========================================
// 🔓 ABRIR / 🔒 CERRAR GRUPO CON IMAGEN
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
        args,
        command
    }) {

        const action =
        (args[0] || '').toLowerCase()

        // 📸 Imagen
        const banner =
        'https://cdn.dix.lat/me/3a1b5867-1ecb-40dc-acf8-250526ebad65.jpg'

        // 🔓 ABRIR
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
                    image: {
                        url: banner
                    },

                    caption:
`╭━━〔 🔓 GRUPO ABIERTO 🔓 〕━━⬣
┃ ⚔️ Ahora todos pueden hablar
┃ 👑 Acción ejecutada correctamente
┃ 🚀 Sistema: GUERRA BOT
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: m
                }
            )

        }

        // 🔒 CERRAR
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
                    image: {
                        url: banner
                    },

                    caption:
`╭━━〔 🔒 GRUPO CERRADO 🔒 〕━━⬣
┃ ⚠️ Solo admins pueden hablar
┃ 🛡️ Protección activada
┃ 🚀 Sistema: GUERRA BOT
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: m
                }
            )

        }

        // ❌ USO
        return conn.sendMessage(
            m.chat,
            {
                image: {
                    url: banner
                },

                caption:
`╭━━〔 ⚙️ USO DEL COMANDO ⚙️ 〕━━⬣
┃ 📌 .grupo abrir
┃ 📌 .grupo cerrar
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            {
                quoted: m
            }
        )

    }

}
