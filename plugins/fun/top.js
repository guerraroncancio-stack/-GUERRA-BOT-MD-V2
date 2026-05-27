import { getRealJid } from '../../lib/identifier.js';

const topCommand = {
    name: 'top',
    alias: ['topg'],
    category: 'fun',

    run: async (m, { conn, text, participants }) => {

        const args = text.trim().split(' ');

        let num = !isNaN(parseInt(args[0])) ? Math.max(1, parseInt(args[0])) : 7;
        let reason = !isNaN(parseInt(args[0])) ? (args.slice(1).join(' ') || 'usuarios aleatorios') : (text.trim() || 'usuarios aleatorios');

        const shuffled = participants
            .map(p => p.id)
            .sort(() => Math.random() - 0.5);

        const selected = shuffled.slice(0, Math.min(num, shuffled.length));

        const real = await Promise.all(
            selected.map(id => getRealJid(conn, id, m))
        );

        let caption =
`🏆 RANKING TOP ${real.length}
━━━━━━━━━━━━━━━━

📌 Motivo: ${reason}

`;

        real.forEach((jid, i) => {
            caption += `• ${i + 1} ➜ @${jid.split('@')[0]}\n`;
        });

        caption += `\n━━━━━━━━━━━━━━━━`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                mentionedJid: real,
                externalAdReply: {
                    title: "Ranking Top",
                    body: reason,
                    thumbnailUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000&auto=format&fit=crop",
                    sourceUrl: "https://github.com/",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};

export default topCommand;
