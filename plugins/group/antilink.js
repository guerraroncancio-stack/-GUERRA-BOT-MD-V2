export const name = 'antilink_pro';

export async function load(conn) {

    conn.ev.on('messages.upsert', async ({ messages }) => {

        const m = messages[0];
        if (!m || !m.message) return;

        const chat = global.db?.data?.chats?.[m.key.remoteJid] || {};

        const isGroup = m.key.remoteJid.endsWith('@g.us');
        if (!isGroup || !chat.antiLink) return;

        const text = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ''
        ).toLowerCase();

        const linkRegex = /chat\.whatsapp\.com\/([0-9a-z]{20,24})/i;
        const channelRegex = /whatsapp\.com\/channel\/([0-9a-z]{20,24})/i;

        const isLink =
            linkRegex.test(text) ||
            channelRegex.test(text);

        if (!isLink) return;

        const sender = m.key.participant || m.key.remoteJid;

        const user = `@${sender.split('@')[0]}`;

        // ❌ si no es admin bot
        const metadata = await conn.groupMetadata(m.key.remoteJid).catch(() => null);
        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        const botIsAdmin = metadata?.participants?.some(p =>
            p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        const isAdmin = metadata?.participants?.some(p =>
            p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (isAdmin) return;

        if (!botIsAdmin) {
            await conn.sendMessage(m.key.remoteJid, {
                text: `🚫 ${user} envió un enlace, pero no soy admin para sancionar.`,
                mentions: [sender]
            });
            return;
        }

        // 🧹 borrar mensaje
        try {
            await conn.sendMessage(m.key.remoteJid, { delete: m.key });
        } catch {}

        // 👢 expulsar
        try {
            await conn.groupParticipantsUpdate(
                m.key.remoteJid,
                [sender],
                'remove'
            );
        } catch {}

        // ⚠️ aviso fuerte
        await conn.sendMessage(m.key.remoteJid, {
            text:
`🚫 *ANTI-LINK ACTIVADO*

${user} fue eliminado del grupo.

⚠️ No está permitido enviar enlaces.
🔒 Respeta las reglas del grupo.`,
            mentions: [sender]
        });

    });
}
