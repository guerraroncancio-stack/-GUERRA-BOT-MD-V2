import axios from 'axios';

const tiktok = {
    name: 'tiktok',
    alias: ['tt'],
    category: 'descargas',
    run: async (m, { conn, args }) => {
        if (!args[0]) return m.reply(`*❐ Ingresa un enlace de TikTok.*`);

        try {
            await m.react("⏳");

            const { data: json } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(args[0])}&apikey=${global.key || ''}`);

            if (!json.data) {
                await m.react("❌");
                return m.reply("ஐ Error al procesar el enlace. Verifica que sea un link válido.");
            }

            const data = json.data;
            const formatter = new Intl.NumberFormat('es-ES');

            const caption = `\t\t\t*𝗧𝗜𝗞-𝗧𝗢𝗞 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦*

> ღ *Autor:* ${data.author?.nickname || 'Anónimo'}
> ✎ *Título:* ${data.title || 'Sin descripción'}
> ⍰ *Duración:* ${data.duration || 0}s
> ♫ *Música:* ${data.music_info?.title || 'Original'}
> ×͜× *Creador:* ${data.music_info?.author || '---'}
\t\t\t*ム ESTADÍSTICAS:*
> 𖤍 *Vistas:* ${formatter.format(data.play_count || 0)}
> ♡ *Likes:* ${formatter.format(data.digg_count || 0)}
> ♛ *Comments:* ${formatter.format(data.comment_count || 0)}
> ★ *Shares:* ${formatter.format(data.share_count || 0)}`;

            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                await sendAlbum(conn, m.chat, data.images, {
                    caption: caption,
                    quoted: m
                });
            } else {
                await conn.sendMessage(m.chat, { 
                    video: { url: data.play },
                    caption: caption,
                    fileName: `tiktok.mp4`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            }

            await m.react("✅");
        } catch (e) {
            console.error(e);
            await m.react("❌");
            m.reply(`> ⚔ *Error exacto:* ${e.message}`);
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
            image: { url: url },
            ...(i === 0 ? { caption: options.caption || "" } : {})
        }, { upload: conn.waUploadToServer });

        msg.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key }
        };

        return conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    }));
}

export default tiktok;
