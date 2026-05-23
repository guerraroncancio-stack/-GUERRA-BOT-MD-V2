/* =========================================
   ⚔️ ADMIN HANDLER — GUERRA BOT
   Powered by Kevin Guerra
========================================= */

const adminHandler = async (m, {
    conn,
    command,
    args,
    text,
    isAdmin,
    isBotAdmin,
    isROwner,
    participants
}) => {

    if (!m.isGroup) {
        return conn.reply(
            m.chat,
            '❌ Este comando solo funciona en grupos.',
            m
        )
    }

    if (!isAdmin && !isROwner) {
        return conn.reply(
            m.chat,
            '❌ Solo los administradores pueden usar este comando.',
            m
        )
    }

    if (!isBotAdmin) {
        return conn.reply(
            m.chat,
            '❌ Necesito ser administrador.',
            m
        )
    }

    switch (command) {

        /* =========================================
           👢 KICK
        ========================================= */

        case 'kick': {

            let users = m.mentionedJid?.length
                ? m.mentionedJid
                : m.quoted
                ? [m.quoted.sender]
                : []

            if (!users.length) {
                return conn.reply(
                    m.chat,
                    '⚠️ Etiqueta o responde al usuario.',
                    m
                )
            }

            await conn.groupParticipantsUpdate(
                m.chat,
                users,
                'remove'
            )

        }
        break

        /* =========================================
           ➕ ADD
        ========================================= */

        case 'add': {

            if (!text) {
                return conn.reply(
                    m.chat,
                    '⚠️ Ingresa un número.',
                    m
                )
            }

            let number =
            text.replace(/\D/g, '') + '@s.whatsapp.net'

            await conn.groupParticipantsUpdate(
                m.chat,
                [number],
                'add'
            )

        }
        break

        /* =========================================
           ⬆️ PROMOTE
        ========================================= */

        case 'promote': {

            let users = m.mentionedJid?.length
                ? m.mentionedJid
                : m.quoted
                ? [m.quoted.sender]
                : []

            if (!users.length) {
                return conn.reply(
                    m.chat,
                    '⚠️ Etiqueta o responde al usuario.',
                    m
                )
            }

            await conn.groupParticipantsUpdate(
                m.chat,
                users,
                'promote'
            )

        }
        break

        /* =========================================
           ⬇️ DEMOTE
        ========================================= */

        case 'demote': {

            let users = m.mentionedJid?.length
                ? m.mentionedJid
                : m.quoted
                ? [m.quoted.sender]
                : []

            if (!users.length) {
                return conn.reply(
                    m.chat,
                    '⚠️ Etiqueta o responde al usuario.',
                    m
                )
            }

            await conn.groupParticipantsUpdate(
                m.chat,
                users,
                'demote'
            )

        }
        break

        /* =========================================
           🔒 GROUP CLOSE
        ========================================= */

        case 'close':
        case 'cerrar': {

            await conn.groupSettingUpdate(
                m.chat,
                'announcement'
            )

            conn.reply(
                m.chat,
                '🔒 Grupo cerrado.',
                m
            )

        }
        break

        /* =========================================
           🔓 GROUP OPEN
        ========================================= */

        case 'open':
        case 'abrir': {

            await conn.groupSettingUpdate(
                m.chat,
                'not_announcement'
            )

            conn.reply(
                m.chat,
                '🔓 Grupo abierto.',
                m
            )

        }
        break

        /* =========================================
           🧹 TAGALL
        ========================================= */

        case 'tagall':
        case 'todos': {

            let teks = `╭━〔 ⚔️ TAG ALL ⚔️ 〕━⬣\n\n`

            for (let mem of participants) {

                teks += `⭔ @${mem.id.split('@')[0]}\n`

            }

            teks += `\n╰━━━━━━━━━━━━⬣`

            await conn.sendMessage(
                m.chat,
                {
                    text: teks,
                    mentions: participants.map(v => v.id)
                },
                { quoted: m }
            )

        }
        break
    }

}

adminHandler.command = [
    'kick',
    'add',
    'promote',
    'demote',
    'close',
    'cerrar',
    'open',
    'abrir',
    'tagall',
    'todos'
]

export default adminHandler
