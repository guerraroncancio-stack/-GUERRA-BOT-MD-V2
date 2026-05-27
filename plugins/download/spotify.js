import fetch from 'node-fetch';

const spotifyCommand = {
    name: 'spotify',
    alias: ['spt', 'sp', 'music'],
    category: 'download',
    col: 0,

    run: async (m, { conn, text, usedPrefix, command }) => {

        if (!text) {
            return m.reply(
`╭─〔 🎧 SPOTIFY DOWNLOADER 〕─╮
│ Uso: ${usedPrefix + command} <canción o URL>
╰────────────────────╯`
            );
        }

        await m.react('🕓');

        try {
            const isUrl = text.match(/^(https?:\/\/)?(www\.)?(open\.spotify\.com|spotify\.link)\/.+$/i);
            let track;

            if (isUrl) {
                track = { url: text, title: 'Spotify Track' };
            } else {
                const searchRes = await fetch(
                    `https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`
                );

                const searchData = await searchRes.json();

                if (!searchData.status || !searchData.data.length) {
                    await m.react('✖️');
                    return m.reply('❌ No se encontraron resultados en Spotify.');
                }

                track = searchData.data[0];

                const info =
`╭─〔 🎶 SPOTIFY RESULT 〕─╮
│ 🎵 Título: ${track.title}
│ 👤 Artista: ${track.artist}
│ 💿 Álbum: ${track.album}
│ ⏱ Duración: ${track.duration}
│ 📅 Publicado: ${track.publish}
│ 🔗 Link: ${track.url || text}
╰────────────────────╯

⏳ Procesando audio...`;

                await conn.sendMessage(m.chat, {
                    image: { url: track.image },
                    caption: info
                }, { quoted: m });
            }

            const downloadRes = await fetch(
                `https://api.delirius.store/download/spotifydl?url=${track.url}`
            );

            const textResponse = await downloadRes.text();

            let downloadData;
            try {
                downloadData = JSON.parse(textResponse);
            } catch {
                await m.react('✖️');
                return m.reply('❌ Error procesando la respuesta de descarga.');
            }

            if (downloadData.status && downloadData.data?.download) {

                await conn.sendMessage(m.chat, {
                    audio: { url: downloadData.data.download },
                    mimetype: 'audio/mpeg',
                    fileName: `${track.title}.mp3`
                }, { quoted: m });

                await m.react('✅');

            } else {
                await m.react('✖️');
                m.reply('❌ No se pudo descargar el audio.');
            }

        } catch (e) {
            console.error(e);
            await m.react('✖️');
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};

export default spotifyCommand;
