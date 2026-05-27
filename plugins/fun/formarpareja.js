import { getRealJid } from '../../lib/identifier.js'

const parejasCommand = {
    name: 'formarpareja',
    alias: ['parejas', 'ship'],
    category: 'fun',
    run: async (m, { conn, participants }) => {

        const shuffled = participants
            .map(p => p.id)
            .sort(() => Math.random() - 0.5);

        if (shuffled.length < 2) {
            return conn.reply(m.chat, '> ⚠ No hay suficientes participantes.', m);
        }

        const limit = Math.min(6, shuffled.length - (shuffled.length % 2));
        const selected = shuffled.slice(0, limit);

        const users = await Promise.all(
            selected.map(id => getRealJid(conn, id, m))
        );

        let txt = `
╭───〔 💞 PAREJAS ALEATORIAS 〕───╮
`.trim();

        for (let i = 0; i < users.length; i += 2) {
            const u1 = users[i];
            const u2 = users[i + 1];
            const love = Math.floor(Math.random() * 100);

            txt += `
│
│ 🫂 @${u1.split('@')[0]} × @${u2.split('@')[0]}
│ 💘 Compatibilidad: ${love}%
`.trim() + '\n';
        }

        txt += `
╰────────────────────────────╯
`.trim();

        return conn.sendMessage(
            m.chat,
            {
                text: txt,
                contextInfo: {
                    mentionedJid: users
                }
            },
            { quoted: m }
        );
    }
};

export default parejasCommand;
