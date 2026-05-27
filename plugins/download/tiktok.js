import axios from 'axios';

const tiktok = {
    name: 'tiktok',
    alias: ['tt'],
    category: 'descargas',

    run: async (m, { conn, args }) => {

        if (!args[0]) {
            return m.reply(
`╭─〔 🎬 TIKTOK DOWNLOADER 〕─╮
│ Uso: /tiktok <link>
╰────────────────────╯`
            );
        }

        try {
            await m.react("⏳");

            const { data: json } = await axios.get(
                `https://tikwm.com/api/?url=${encodeURIComponent(args[0])}&apikey=${global.key || ''}`
            );

            if (!json.data) {
                await m.react("❌");
                return m.reply("❌ No se pudo procesar el enlace.");
            }

            const data = json.data;

            const fmt = new Intl.NumberFormat('es-ES');

            const caption =
`╭─〔 🎵 TIKTOK RESULT 〕─╮
│ 👤 Autor: ${data.author?.nickname || 'Anónimo'}
│ 📝 Título: ${data.title || 'Sin descripción'}
│ ⏱ Duración: ${data.duration || 0}s
│ 🎶 Música: ${data.music_info?.title || 'Original'}
│ 👑 Creador: ${data.music_info?.author || '---'}
╰────────────────────╯

╭─〔 📊 ESTADÍSTICAS 〕─╮
│ 👁 Vistas: ${fmt.format(data.play_count || 0)}
│ ❤️ Likes: ${fmt.format(data.digg_count || 0)}
│ 💬 Comentarios: ${fmt.format(data.comment_count || 0)}
│ 🔁 Shares: ${fmt.format(data.share_count || 0)}
╰────────────────────╯

🔗 Link: ${args[0]}`;

            // si es álbum de imágenes
            if (data.images?.length > 0) {
                await sendAlbum(conn, m.chat, data.images, {
                    caption,
                    quoted: m
                });
            } else {
                await conn.sendMessage(m.chat, {
                    video: { url: data.play },
                    caption,
                    fileName: `tiktok.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            }

            await m.react("✅");

        } catch (e) {
            console.error(e);
            await m.react("❌");
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};

async function sendAlbum(conn, jid, urls, options = {}) {
    const album = conn.generateWAMessageFromContent(jid, {
        albumMessage: {
            expectedImageCount: urls.length,
            ...(options.quoted ? {
                contextInfo: {
                    stanzaId: options.quoted.key.id,
                    participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                    quotedMessage: options.quoted.message,
                }
            } : {}),
        }
    }, {});

    await conn.relayMessage(jid, album.message, { messageId: album.key.id });

    await Promise.all(urls.map(async (url, i) => {
        const msg = await conn.generateWAMessage(jid, {
            image: { url },
            ...(i === 0 ? { caption: options.caption || "" } : {})
        }, { upload: conn.waUploadToServer });

        msg.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key }
        };

        return conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    }));
}

export default tiktok;
