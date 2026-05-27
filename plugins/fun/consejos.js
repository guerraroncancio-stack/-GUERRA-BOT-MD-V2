import axios from 'axios';

const reflexionCommand = {
    name: 'advice',
    alias: ['consejo', 'frase'],
    category: 'crecimiento',
    run: async (m, { conn, text }) => {
        const urlRaw = 'https://raw.githubusercontent.com/eliac-d/database/main/src/consejos.json';

        try {
            const { data } = await axios.get(urlRaw);
            let lista = data.reflexiones_masivas;

            if (text) {
                const q = text.toLowerCase();
                lista = lista.filter(r =>
                    r.categoria.toLowerCase().includes(q) ||
                    r.autor.toLowerCase().includes(q)
                );
            }

            if (!lista.length) {
                return m.reply('> ⚠️ No se encontraron consejos con ese filtro.');
            }

            const r = lista[Math.floor(Math.random() * lista.length)];

            const mensaje = `
╭───〔 💡 CONSEJO 〕───╮
│ ✦ ${r.categoria}
╰────────────────────╯

❝ ${r.texto} ❞

➤ ${r.autor}
`.trim();

            await conn.sendMessage(
                m.chat,
                {
                    text: mensaje,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('Error en reflexiones:', error);
            m.reply('> ❌ Error al obtener el consejo.');
        }
    }
};

export default reflexionCommand;
