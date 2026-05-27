import axios from 'axios';

const memeApiCommand = {
    name: 'memevid',
    alias: ['meme2', 'dixmeme'],
    category: 'fun',
    run: async (m, { conn }) => {
        await m.react('⏳');

        try {
            const { data } = await axios.get('https://api.dix.lat/memevid');

            if (!data?.url) throw new Error('URL inválida');

            await m.react('🎬');

            await conn.sendMessage(
                m.chat,
                {
                    video: { url: data.url },
                    caption: '🎬 meme random'
                },
                { quoted: m }
            );

        } catch (err) {
            console.error(err);
            await m.react('🚫');

            await conn.sendMessage(
                m.chat,
                {
                    text: `❌ Error: ${err.message}`
                },
                { quoted: m }
            );
        }
    }
};

export default memeApiCommand;
