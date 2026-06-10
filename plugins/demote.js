import fetch from 'node-fetch'

let thumb = null

fetch('https://api.dix.lat/media2/1777604199636.jpg')
    .then(r => r.arrayBuffer())
    .then(buf => {
        thumb = Buffer.from(buf)
    })
    .catch(() => null)

export default {
    name: 'demote',
    command: ['demote', 'degradar'],
    tags: ['group'],
    group: true,
    admin: true,
    botAdmin: true,

    async run(m, { conn, text }) {

        try {

            const metadata = await conn.groupMetadata(m.chat)
            const participants = metadata.participants || []

            const fkontak = {
                key: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: 'Guerra'
                },
                message: {
                    locationMessage: {
                        name: '👑 GUERRA BOT',
                        jpegThumbnail: thumb || null
                    }
                },
                participant: '0@s.whatsapp.net'
            }

            // =========================
            // OBTENER USUARIO
            // =========================

            let user = null

            if (m.quoted) {
                user =
                    m.quoted.sender ||
                    m.quoted.author ||
                    m.quoted.participant ||
                    m.quoted.key?.participant ||
                    null
            }

            if (!user && m.mentionedJid?.length) {
                user = m.mentionedJid[0]
            }

            if (!user && text) {

                const number = text.replace(/\D/g, '')

                if (number.length >= 7) {
                    user = `${number}@s.whatsapp.net`
                }
            }

            if (!user) {
                return conn.sendMessage(
                    m.chat,
                    {
                        text: '🍭 Responde o menciona al administrador que deseas degradar.'
                    },
                    { quoted: fkontak }
                )
            }

            user = conn.decodeJid(user)

            // =========================
            // BUSCAR PARTICIPANTE
            // =========================

            const target = participants.find(p => {

                const jid = conn.decodeJid(
                    p.id ||
                    p.jid ||
                    p.participant ||
                    ''
                )

                return jid === user

            })

            if (!target) {

                return conn.sendMessage(
                    m.chat,
                    {
                        text: '❌ El usuario no pertenece a este grupo.'
                    },
                    { quoted: fkontak }
                )
            }

            // =========================
            // VALIDAR ADMIN
            // =========================

            const isAdmin =
                target.admin === 'admin' ||
                target.admin === 'superadmin'

            if (!isAdmin) {

                return conn.sendMessage(
                    m.chat,
                    {
                        text: '❌ Ese usuario no es administrador.'
                    },
                    { quoted: fkontak }
                )
            }

            // =========================
            // PROTECCIONES
            // =========================

            const ownerGroup =
                metadata.owner ||
                `${m.chat.split('-')[0]}@s.whatsapp.net`

            if (
                conn.decodeJid(ownerGroup) ===
                conn.decodeJid(user)
            ) {

                return conn.sendMessage(
                    m.chat,
                    {
                        text: '🚫 No puedes degradar al propietario del grupo.'
                    },
                    { quoted: fkontak }
                )
            }

            if (
                conn.decodeJid(user) ===
                conn.decodeJid(conn.user.id)
            ) {

                return conn.sendMessage(
                    m.chat,
                    {
                        text: '🚫 No puedo degradarme a mí mismo.'
                    },
                    { quoted: fkontak }
                )
            }

            // =========================
            // DEMOTE
            // =========================

            await conn.groupParticipantsUpdate(
                m.chat,
                [user],
                'demote'
            )

            await conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 📉 ADMIN REMOVIDO 〕━━⬣
┃
┃ 👤 Usuario:
┃ @${user.split('@')[0]}
┃
┃ ⚠️ Ya no es administrador
┃
╰━━━━━━━━━━━━━━━━⬣`,
                    mentions: [user]
                },
                { quoted: fkontak }
            )

        } catch (e) {

            console.error('[DEMOTE ERROR]', e)

            return conn.sendMessage(
                m.chat,
                {
                    text: '❌ Error al ejecutar el demote.'
                },
                { quoted: m }
            )
        }
    }
}
