const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {

    try {

        if (!m.isGroup) return;
        if (!m.text) return;
        if (m.isBaileys || m.fromMe) return;

        const chat = global.db.data.chats[m.chat] =
            global.db.data.chats[m.chat] || {};

        const user = m.sender;

        // =========================
        // CONFIG
        // =========================

        if (!chat.antiLink) return;

        const isGroupLink = linkRegex.test(m.text);
        const isChannelLink = channelLinkRegex.test(m.text);

        if (!isGroupLink && !isChannelLink) return;

        // =========================
        // PROTECCIONES
        // =========================

        if (isAdmin || isOwner || isROwner) return;

        if (!isBotAdmin) {
            return conn.reply(
                m.chat,
                `⚠️ Necesito ser admin para activar anti-link.`,
                m
            );
        }

        // =========================
        // INIT WARNING DB
        // =========================

        chat.warn = chat.warn || {}
        chat.warn[user] = chat.warn[user] || 0

        // =========================
        // BLOQUEO MISMO GRUPO
        // =========================

        try {
            const code = await conn.groupInviteCode(m.chat)
            const myLink = `https://chat.whatsapp.com/${code}`

            if (m.text.includes(myLink)) return
        } catch {}

        // =========================
        // DELETE MESSAGE
        // =========================

        await conn.sendMessage(m.chat, {
            delete: m.key
        }).catch(() => {})

        // =========================
        // WARNING SYSTEM
        // =========================

        chat.warn[user] += 1

        const warns = chat.warn[user]

        // =========================
        // RESPUESTA
        // =========================

        if (warns < 2) {

            return conn.sendMessage(m.chat, {
                text: `⚠️ *ANTILINK ACTIVADO*\n\n@${user.split('@')[0]} no está permitido enviar enlaces.\n\n⚠️ Advertencia: ${warns}/2`,
                mentions: [user]
            })

        }

        // =========================
        // KICK (2 WARNINGS)
        // =========================

        chat.warn[user] = 0

        await conn.sendMessage(m.chat, {
            text: `🚫 *EXPULSADO POR ANTILINK*\n\n@${user.split('@')[0]} alcanzó 2 advertencias.`,
            mentions: [user]
        })

        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    } catch (e) {
        console.log('[ANTILINK ERROR]', e)
    }

    return true
}
