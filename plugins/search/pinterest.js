import axios from 'axios';

async function pinterestScraper(judul) {
    const query = encodeURIComponent(judul);
    const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22applied_unified_filters%22%3Anull%2C%22appliedProductFilters%22%3A%22---%22%2C%22article%22%3Anull%2C%22auto_correction_disabled%22%3Afalse%2C%22corpus%22%3Anull%2C%22customized_rerank_type%22%3Anull%2C%22domains%22%3Anull%2C%22dynamicPageSizeExpGroup%22%3A%22control%22%2C%22filters%22%3Anull%2C%22journey_depth%22%3Anull%2C%22page_size%22%3Anull%2C%22price_max%22%3Anull%2C%22price_min%22%3Anull%2C%22query_pin_sigs%22%3Anull%2C%22query%22%3A%22${query}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22request_params%22%3Anull%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%2C%22selected_one_bar_modules%22%3Anull%2C%22seoDrawerEnabled%22%3Afalse%2C%22source_id%22%3Anull%2C%22source_module_id%22%3Anull%2C%22source_url%22%3A%22%2Fsearch%2Fpins%2F%3Fq%3D${query}%26rs%3Dtyped%22%2C%22top_pin_id%22%3Anull%2C%22top_pin_ids%22%3Anull%7D%2C%22context%22%3A%7B%7D%7D`;

    const headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'referer': 'https://id.pinterest.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'x-app-version': 'c056fb7',
        'x-pinterest-appstate': 'active',
        'x-pinterest-pws-handler': 'www/index.js',
        'x-pinterest-source-url': '/',
        'x-requested-with': 'XMLHttpRequest'
    };

    try {
        const res = await axios.get(link, { headers, timeout: 15000 });
        const results = res.data?.resource_response?.data?.results;

        if (results && Array.isArray(results)) {
            return results.map(item => {
                if (item.images) {
                    return {
                        url: item.images.orig?.url || null,
                        author: item.pinner?.full_name || "N/A",
                        title: item.title || "No Title",
                        board: item.board?.name || "N/A",
                        id: item.id,
                        pin_url: `https://www.pinterest.com${item.url}`
                    };
                }
                return null;
            }).filter(img => img !== null);
        }
        return [];
    } catch (error) {
        throw error;
    }
}

const pinterestCommand = {
    name: 'pinterest',
    alias: ['pin'],
    category: 'search',
    run: async (m, { conn, text }) => {
        if (!text) return conn.reply(m.chat, `\t\t\t *『 PINTEREST SEARCH 』* \n\n> ✎ Ingresa un texto para iniciar la búsqueda...`, m);

        try {
            await m.react('🕒');

            const results = await pinterestScraper(text);

            if (!results || results.length === 0) {
                await m.react('❌');
                return conn.reply(m.chat, `> ⍰ No se encontraron resultados para: *${text}*`, m);
            }

            const maxImages = Math.min(results.length, 4);
            const limitedResults = results.slice(0, maxImages);
            const randomPick = limitedResults[Math.floor(Math.random() * limitedResults.length)];
            const imageUrls = limitedResults.map(r => r.url);

            const caption = `\t\t*── 「 PINTEREST ALBUM 」 ──*\n\n` +
                             `▢ *BÚSQUEDA:* ${text}\n` +
                             `▢ *TÍTULO:* ${randomPick.title || 'Sin título'}\n` +
                             `▢ *AUTOR:* ${randomPick.author || 'Desconocido'}\n` +
                             `▢ *CANTIDAD:* ${maxImages}\n\n`;

            await sendAlbum(conn, m.chat, imageUrls, {
                caption: caption,
                quoted: m
            });

            await m.react('✅');

        } catch (error) {
            await m.react('❌');
            console.error(`> [ERROR PINTEREST]: ${error.message}`);
            conn.reply(m.chat, `> ⚔ *Error exacto:* ${error.message}`, m);
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

export default pinterestCommand;
