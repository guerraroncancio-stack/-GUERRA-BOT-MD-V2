// =========================================
// 👑 GUERRA BOT — OPEN/CLOSE SYSTEM
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

        // =========================================
        // ⚡ ACTION DETECT
        // =========================================

        let action =
        (args[0] || '').toLowerCase()

        if (
            ['abrir', 'open'].includes(command)
        ) {
            action = 'abrir'
        }

        if (
            ['cerrar', 'close'].includes(command)
        ) {
            action = 'cerrar'
        }

        // =========================================
        // 👑 VERIFIED STYLE
        // =========================================

        const fkontak = {

            key: {
                remoteJid: m.chat,
                fromMe: false,
                id: 'GUERRA-BOT'
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

        if (
            action === 'abrir' ||
            action === 'open'
        ) {

            await conn.groupSettingUpdate(
                m.chat,
                'not_announcement'
            )

            return await conn.sendMessage(
                m.chat,
                {
                    text:
`╭═━═⌬〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 👑 〕⌬═━═╮
┃
┃  🔓 𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐈𝐄𝐑𝐓𝐎
┃  💬 Todos pueden enviar mensajes
┃
┃  ⚡ Estado actualizado correctamente
┃  🛡️ Sistema protegido y estable
┃
╰═━════════════════════━━═╯`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // 🔒 CLOSE GROUP
        // =========================================

        if (
            action === 'cerrar' ||
            action === 'close'
        ) {

            await conn.groupSettingUpdate(
                m.chat,
                'announcement'
            )

            return await conn.sendMessage(
                m.chat,
                {
                    text:
`╭═━═⌬〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 👑 〕⌬═━═╮
┃  🔒 𝐆𝐑𝐔𝐏𝐎 𝐂𝐄𝐑𝐑𝐀𝐃𝐎
┃  🚫 Solo admins pueden hablar
┃  ⚡ Protección activada correctamente
┃  🛡️ Seguridad reforzada
╰═━════════════════════━━═╯`
                },
                {
                    quoted: fkontak
                }
            )

        }

        // =========================================
        // ❌ HELP MENU
        // =========================================

        return await conn.sendMessage(
            m.chat,
            {
                text:
`╭═━═⌬〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 👑 〕⌬═━═╮
┃  🔒 Estado del grupo actualizado
┃  🚫 Solo administradores pueden hablar
┃  ⚡ Protección activada correctamente
┃  🛡️ Sistema protegido y activo
╰═━══════════════════━═╯`
            },
            {
                quoted: fkontak
            }
        )

    }

}
