import { jidNormalizedUser } from '@whiskeysockets/baileys';

const antiLinkPlugin = {
    name: 'antilink_pro',

    async before(m, { conn, isAdmin, isBotAdmin, isOwner, chat }) {

        const config = chat || {}

        if (
            !m.isGroup ||
            !config.antiLink ||
            isOwner ||
            isAdmin ||
            m.fromMe
        ) return false;

        const text = (
            m.text ||
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ''
        ).toLowerCase().trim();

        const linkRegex = /chat\.whatsapp\.com\/([0-9a-z]{20,24})/i;
        const channelRegex = /whatsapp\.com\/channel\/([0-9a-z]{20,24})/i;

        const isLink =
            linkRegex.test(text) ||
            channelRegex.test(text) ||
            m.message?.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo;

        if (!isLink) return false;

        // 🔥 ignorar link del propio grupo
        if (linkRegex.test(text)) {
            const code = await conn.groupInviteCode(m.chat).catch(() => null);
            if (code && text.includes(code.toLowerCase())) return false;
        }

        const user = `@${m.sender.split('@')[0]}`;

        // ❌ si bot no es admin
        if (!isBotAdmin) {
            await conn.sendMessage(m.chat, {
                text:
`🚫 *ENLACE DETECTADO*

${user} intentó enviar un link.

⚠️ No puedo aplicar sanciones porque no soy admin.
🔐 El sistema anti-link está activo.`,
                mentions: [m.sender]
            }, { quoted: m });

            return true;
        }

        // 🧹 BORRAR MENSAJE
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch {}

        // 👢 EXPULSAR USUARIO
        try {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        } catch {}

        // ⚠️ MENSAJE FINAL MEJORADO
        await conn.sendMessage(m.chat, {
            text:
`🚫 *ANTI-LINK ACTIVADO*

${user} ha sido eliminado del grupo.

⚠️ *REGLA:* No está permitido enviar enlaces.
📌 Si continúas, podrás ser expulsado permanentemente.
🔒 Mantén el grupo libre de spam.`,
            mentions: [m.sender]
        });

        return true;
    }
};

export default antiLinkPlugin;
