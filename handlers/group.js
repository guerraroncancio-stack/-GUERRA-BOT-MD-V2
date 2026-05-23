/* =========================================
   ⚔️ GROUP HANDLER — GUERRA BOT
   Powered by Kevin Guerra
========================================= */

const groupHandler = async (m, {
    conn,
    command,
    text,
    isAdmin,
    isBotAdmin,
    participants
}) => {

    if (!m.isGroup) {
        return conn.reply(
            m.chat,
            '❌ Este comando solo funciona en grupos.',
            m
        )
    }

    switch (command) {

        /* =========================================
           👥 INFO GROUP
        ========================================= */

        case 'group':
        case 'gpinfo': {

            const metadata =
            await conn.groupMetadata(m.chat)

            const owner =
            metadata.owner
            ? '@' + metadata.owner.split('@')[0]
            : 'Desconocido'

            const admins =
            participants.filter(v => v.admin)

            const teks = `
╭━━〔 ⚔️ GROUP INFO ⚔️ 〕━━⬣

✦ Nombre:
${metadata.subject}

✦ ID:
${metadata.id}

✦ Miembros:
${participants.length}

✦ Admins:
${admins.length}

✦ Owner:
${owner}

✦ Descripción:
${metadata.desc || 'Sin descripción'}

╰━━━━━━━━━━━━━━━━⬣
`.trim()

            await conn.sendMessage(
                m.chat,
                {
                    text: teks,
                    mentions: metadata.owner
                        ? [metadata.owner]
                        : []
                },
                { quoted: m }
            )

        }
        break

        /* =========================================
           🖼️ CHANGE GROUP NAME
        ========================================= */

        case 'setname':
        case 'setsubject': {

            if (!isAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Solo admins.',
                    m
                )
            }

            if (!isBotAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Necesito admin.',
                    m
                )
            }

            if (!text) {
                return conn.reply(
                    m.chat,
                    '⚠️ Ingresa el nuevo nombre.',
                    m
                )
            }

            await conn.groupUpdateSubject(
                m.chat,
                text
            )

            conn.reply(
                m.chat,
                '✅ Nombre actualizado.',
                m
            )

        }
        break

        /* =========================================
           📝 CHANGE DESCRIPTION
        ========================================= */

        case 'setdesc':
        case 'setdescription': {

            if (!isAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Solo admins.',
                    m
                )
            }

            if (!isBotAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Necesito admin.',
                    m
                )
            }

            if (!text) {
                return conn.reply(
                    m.chat,
                    '⚠️ Ingresa la descripción.',
                    m
                )
            }

            await conn.groupUpdateDescription(
                m.chat,
                text
            )

            conn.reply(
                m.chat,
                '✅ Descripción actualizada.',
                m
            )

        }
        break

        /* =========================================
           🔗 GROUP LINK
        ========================================= */

        case 'linkgroup':
        case 'linkgp': {

            if (!isBotAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Necesito admin.',
                    m
                )
            }

            const code =
            await conn.groupInviteCode(m.chat)

            conn.reply(
                m.chat,
                `🔗 https://chat.whatsapp.com/${code}`,
                m
            )

        }
        break

        /* =========================================
           🧹 REVOKE LINK
        ========================================= */

        case 'revoke':
        case 'resetlink': {

            if (!isAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Solo admins.',
                    m
                )
            }

            if (!isBotAdmin) {
                return conn.reply(
                    m.chat,
                    '❌ Necesito admin.',
                    m
                )
            }

            await conn.groupRevokeInvite(
                m.chat
            )

            conn.reply(
                m.chat,
                '✅ Link reiniciado.',
                m
            )

        }
        break
    }

}

groupHandler.command = [
    'group',
    'gpinfo',
    'setname',
    'setsubject',
    'setdesc',
    'setdescription',
    'linkgroup',
    'linkgp',
    'revoke',
    'resetlink'
]

export default groupHandler
