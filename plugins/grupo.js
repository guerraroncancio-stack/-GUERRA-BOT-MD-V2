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
╭═━═⌬〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 👑 〕⌬═━═╮
┃  🔓 Estado del grupo actualizado
┃  💬 Todos los miembros pueden hablar
┃  ⚡ Acción ejecutada con éxito
┃  🛡️ Sistema protegido y activo
╰═━══════════════════━═╯
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
╭═━═⌬〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 👑 〕⌬═━═╮
┃  🔒 Estado del grupo actualizado
┃  🚫 Solo administradores pueden hablar
┃  ⚡ Protección activada correctamente
┃  🛡️ Sistema protegido y activo
╰═━══════════════════━═╯
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
