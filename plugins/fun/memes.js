import axios from 'axios';

const memesCommand = {
    name: 'memes',
    alias: ['meme'],
    category: 'fun',
    run: async (m, { conn }) => {
        try {
            m.react('🕒');

            const { data: res } = await axios.get(`${url_api}/api/search/memes?apikey=voker`);

            if (!res?.éxito || !res.memes?.length) {
                m.react('❌');
                return conn.reply(m.chat, '⚠ No se encontraron memes en este momento.', m);
            }

            const memeUrl = res.memes[Math.floor(Math.random() * res.memes.length)];

            const caption = `
😂 MEME RANDOM
────────────────

✨ Disfruta tu dosis de humor

────────────────
`.trim();

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: memeUrl },
                    caption,
                    mentions: [m.sender]
                },
                { quoted: m }
            );

            m.react('✅');

        } catch (error) {
            console.error(error);
            m.react('❌');
        }
    }
};

export default memesCommand;
