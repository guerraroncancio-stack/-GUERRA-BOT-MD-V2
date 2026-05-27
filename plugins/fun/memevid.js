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

            const caption =
`🎬 *MEME ALEATORIO*
────────────────
😂 Disfruta el video
⚡ Humor instantáneo
────────────────`;

            await m.react('🎥');

            await conn.sendMessage(m.chat, {
                video: { url },   // Baileys maneja stream directo
                caption
            }, { quoted: m });

            await m.react('✅');

        } catch (err) {
            console.error(err);

            await m.react('❌');

            await conn.sendMessage(m.chat, {
                text:
`❌ *ERROR MEMEVID*
────────────────
⚠️ No se pudo enviar el video
🔁 Intenta nuevamente`
            }, { quoted: m });
        }
    }
};

export default memeApiCommand;
