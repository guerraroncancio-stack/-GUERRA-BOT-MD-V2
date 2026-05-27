import axios from 'axios';

const memeApiCommand = {
    name: 'memevid',
    alias: ['meme2', 'dixmeme'],
    category: 'fun',

    run: async (m, { conn }) => {
        await m.react('⏳');

        try {
            let url = null;
            let tries = 0;

            // intentos hasta encontrar video válido
            while (!url && tries < 3) {
                tries++;

                const { data } = await axios.get('https://api.dix.lat/memevid');
                const candidate = data?.url;

                if (!candidate) continue;

                // NO HEAD (rompe APIs)
                url = candidate;
            }

            if (!url) throw new Error('No se obtuvo video válido');

            await conn.sendMessage(m.chat, {
                video: { url },
                caption: `🎬 *MEME ALEATORIO*\n😂 Disfruta`
            }, { quoted: m });

            await m.react('✅');

        } catch (err) {
            console.error(err);
            await m.react('❌');

            await conn.sendMessage(m.chat, {
                text: `❌ No se pudo obtener meme`
            }, { quoted: m });
        }
    }
};

export default memeApiCommand;
