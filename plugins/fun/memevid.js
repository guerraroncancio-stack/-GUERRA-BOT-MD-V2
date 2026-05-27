import axios from 'axios';

const memeApiCommand = {
    name: 'memevid',
    alias: ['meme2', 'dixmeme'],
    category: 'fun',
    run: async (m, { conn }) => {
        await m.react('⏳');

        try {
            const { data } = await axios.get('https://api.dix.lat/memevid');

            const url = data?.url;
            if (!url) throw new Error('API sin URL');

            // validar que el video exista antes de enviarlo
            const head = await axios.head(url).catch(() => null);
            if (!head) throw new Error('Video expirado o caído');

            const caption =
`🎬 *MEME ALEATORIO*
────────────────
😂 Disfruta este video
⚡ Humor rápido
────────────────`;

            await m.react('🎥');

            await conn.sendMessage(m.chat, {
                video: { url },
                caption
            }, { quoted: m });

            await m.react('✅');

        } catch (err) {
            console.error(err);
            await m.react('🚫');

            await conn.sendMessage(m.chat, {
                text:
`❌ *ERROR MEME*
────────────────
⚠️ No se pudo cargar el video
🔁 Intenta de nuevo`
            }, { quoted: m });
        }
    }
};

export default memeApiCommand;
