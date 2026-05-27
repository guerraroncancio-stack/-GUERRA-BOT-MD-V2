import axios from 'axios';

const poemaCommand = {
    name: 'poema',
    alias: ['verso', 'poesia'],
    category: 'cultura',

    run: async (m, { conn, text }) => {
        const urlRaw = 'https://raw.githubusercontent.com/eliac-d/database/main/src/poemas.json';

        try {
            const { data } = await axios.get(urlRaw);

            let lista = data.poemas_masivos;

            if (text) {
                const q = text.toLowerCase();
                lista = lista.filter(p =>
                    p.autor.toLowerCase().includes(q) ||
                    p.titulo.toLowerCase().includes(q)
                );
            }

            if (!lista.length) {
                return conn.reply(m.chat, '📭 No se encontraron poemas.', m);
            }

            const p = lista[Math.floor(Math.random() * lista.length)];

            const caption =
`📜 *POEMA ALEATORIO*
────────────────
✦ *${p.titulo}*
✦ Autor: ${p.autor}
✦ Estilo: ${p.estilo}
────────────────

${p.texto}

────────────────`;

            await conn.sendMessage(m.chat, {
                text: caption,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            await conn.reply(m.chat, '❌ Error al obtener poema.', m);
        }
    }
};

export default poemaCommand;
