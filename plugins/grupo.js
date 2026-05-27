// =========================================
// 👑 GUERRA BOT — GROUP SYSTEM
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
        'gc',
        'abrir',
        'cerrar',
        'open',
        'close'
    ],

    group: true,
    admin: true,
    botAdmin: true,

    async run(m, {
        conn,
        args,
        command
    }) {

        let action =
        (args[0] || '').toLowerCase()

        if (
            ['abrir', 'open'].includes(command)
        ) action = 'abrir'

        if (
            ['cerrar', 'close'].includes(command)
        ) action = 'cerrar'

        // =========================================
        // 👑 VERIFIED STYLE
        // =========================================

        const fkontak = {

            key: {
                remoteJid: m.chat,
                fromMe: false,
                id: 'GUERRA-X'
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
        // 🔓 OPEN GROUP
        // =========================================

        if (action === 'abrir') {

            await conn.groupSettingUpdate(
                m.chat,
                'not_announcement'
            )

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐒𝐘𝐒𝐓𝐄𝐌 👑 〕━⬣
┃ ✦ Estado: OPENED
┃ ✦ Chat liberado correctamente
┃ ✦ Todos pueden hablar 💬
┃ ⚡ Protección sincronizada
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // 🔒 CLOSE GROUP
        // =========================================

        if (action === 'cerrar') {

            await conn.groupSettingUpdate(
                m.chat,
                'announcement'
            )

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐒𝐘𝐒𝐓𝐄𝐌 👑 〕━⬣
┃ ✦ Estado: CLOSED
┃ ✦ Solo admins pueden hablar 🚫
┃ ✦ Protección activada
┃ ⚡ Seguridad reforzada
╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // ❌ HELP MENU
        // =========================================

        return conn.sendMessage(
            m.chat,
            {
                text:
`╭━〔 ⚙️ 𝐆𝐑𝐎𝐔𝐏 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ⚙️ 〕━⬣
┃ ✦ .grupo abrir
┃ ✦ .grupo cerrar
┃ ✦ .abrir
┃ ✦ .cerrar
╰━━━━━━━━━━━━━━━━━━⬣`
            },
            {
                quoted: fkontak
            }
        )

    }

}
