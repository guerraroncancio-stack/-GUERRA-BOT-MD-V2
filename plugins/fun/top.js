import { getRealJid } from '../../lib/identifier.js' 

const topCommand = {
    name: 'top',
    alias: ['topg'],
    category: 'fun',
    run: async (m, { conn, text, participants, command, usedPrefix }) => {
        const args = text.trim().split(' ');
        let num;
        let topReason;

        if (!isNaN(parseInt(args[0]))) {
            num = parseInt(args[0]);
            topReason = args.slice(1).join(' ') || 'usuarios aleatorios';
        } else {
            num = 7;
            topReason = text.trim() || 'usuarios aleatorios';
        }

        if (num <= 0) num = 7;

        let shuffled = participants
            .map(p => p.id)
            .sort(() => 0.5 - Math.random());

        const limit = Math.min(num, shuffled.length);
        const selected = shuffled.slice(0, limit);

        const realParticipants = await Promise.all(
            selected.map(async (id) => {
                return await getRealJid(conn, id, m);
            })
        );

        let txt = `> ┏━━━〔 ᴛᴏᴘ ${limit} ${topReason.toUpperCase()} 〕━━━┓\n`;

        realParticipants.forEach((jid, i) => {
            txt += `> ┃ ${i + 1}. @${jid.split('@')[0]}\n`;
        });

        txt += `> ┗━━━━━━━━━━━━━━━━━━━━┛`;

        return conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                mentionedJid: realParticipants,
                groupMentions: [],
                remoteJidAlt: m.chat
            }
        }, { quoted: m });
    }
};

export default topCommand;
