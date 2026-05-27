import axios from 'axios';

const reflexionCommand = {
    name: 'reflexion',
    alias: ['reflexión', 'meditar', 'existencia'],
    category: 'crecimiento',

    run: async (m, { conn, text }) => {

        const urlRaw = 'https://raw.githubusercontent.com/eliac-d/database/main/src/reflexion.json';

        try {
            const { data } = await axios.get(urlRaw);

            const lista = Array.isArray(data)
                ? data
                : data.reflexiones || [];

            let filtradas = lista;

            if (text) {
                const q = text.toLowerCase();
                filtradas = lista.filter(r =>
                    r.tema?.toLowerCase().includes(q) ||
                    r.titulo?.toLowerCase().includes(q)
                );
            }

            const r = filtradas.length
                ? filtradas[Math.floor(Math.random() * filtradas.length)]
                : lista[Math.floor(Math.random() * lista.length)];

            const caption =
`╭─ ✦ *REFLEXIÓN* ✦ ─╮
│ ✧ ${r.titulo}
│ ❖ ${r.tema}
╰───────────────╯

💭 ${r.wa_format}

━━━━━━━━━━━━━━
🧠 *Momento de introspección*
`;

            await conn.sendMessage(m.chat, {
                text: caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: r.titulo || 'Reflexión',
                        body: 'Sistema de pensamientos',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop',
                        sourceUrl: 'https://github.com/deylin-16/database',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error(error);

            await conn.sendMessage(m.chat, {
                text: '❌ Error al conectar con la base de reflexiones.'
            }, { quoted: m });
        }
    }
};

export default reflexionCommand;
