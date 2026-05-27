// =========================================
// 🔓 ABRIR / 🔒 CERRAR GRUPO VERIFICADO
// =========================================

import fetch from 'node-fetch'

let thumb = null

fetch('https://cdn.dix.lat/me/c58ae6d8-2932-4f99-bb9a-7527cbe9573b.jpg')
.then(res => res.arrayBuffer())
.then(buf => {
    thumb = Buffer.from(buf)
})
.catch(() => null)

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

        // =========================================
        // 📌 MENSAJE VERIFICADO
        // =========================================

        const fkontak = {

            key: {
                remoteJid: m.chat,
                fromMe: false,
                id: 'GUERRA'
            },

            message: {

                locationMessage: {

                    name: 'GUERRA BOT VERIFIED',

                    jpegThumbnail: thumb

                }

            },

            participant: '0@s.whatsapp.net'

        }

        // =========================================
        // 🔓 ABRIR
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
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // 🔒 CERRAR
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
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // ❌ USO
        // =========================================

        return conn.sendMessage(
            m.chat,
            {
                text:
`╭━━〔 ⚙️ USO DEL COMANDO ⚙️ 〕━━⬣
┃ 📌 .grupo abrir
┃ 📌 .grupo cerrar
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            {
                quoted: fkontak
            }
        )

    }

}
