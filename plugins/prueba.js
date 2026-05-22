import axios from 'axios';
import * as cheerio from 'cheerio';

const investigarCommand = {
    name: 'ct',
    alias: ['buscar'],
    category: 'herramientas',
    run: async (m, { conn, text }) => {
        if (!text) return m.reply('Escribe qué quieres investigar.');

        try {
            const query = encodeURIComponent(text);
            const url = `https://www.google.com/search?q=${query}&hl=es&gl=es`;

            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
                    'Accept': 'text/html',
                    'Accept-Language': 'es-ES,es;q=0.9'
                }
            });

            const $ = cheerio.load(data);
            const resultados = [];
            const seenUrls = new Set();

            const links = $('*:has(> a) > a').filter((_, el) => {
                const href = $(el).attr('href');
                if (href?.includes('x.com')) {
                    return $(el).parent().children('span').length === 2;
                }
                return $(el).children('span').length === 2;
            });

            links.each((_, el) => {
                const rawUrl = $(el).attr('href');
                if (!rawUrl) return;

                let url = decodeURIComponent(
                    rawUrl.startsWith('/url?q=')
                        ? rawUrl.split('&')[0].replace('/url?q=', '')
                        : rawUrl
                );
                url = url?.split('?')?.[0];

                if (!url || seenUrls.has(url) || url === '/search' || url.startsWith('/')) return;
                seenUrls.add(url);

                const titulo = $(el).find('span').first().text().trim();
                const snippet = $(el).parent()?.parent()?.find('table')?.first()?.text()?.trim() || '';

                if (titulo && url.startsWith('http')) {
                    resultados.push({ titulo, url, snippet });
                }
            });

            if (resultados.length === 0) return m.reply('❌ No se encontraron resultados.');

            let respuesta = `🔍 *BÚSQUEDA: ${text.toUpperCase()}*\n\n`;

            resultados.slice(0, 4).forEach((r, i) => {
                respuesta += `${i + 1}. *${r.titulo}*\n`;
                if (r.snippet) respuesta += `📄 ${r.snippet.slice(0, 180)}${r.snippet.length > 180 ? '...' : ''}\n`;
                respuesta += `🔗 ${r.url}\n\n`;
            });

            await conn.sendMessage(m.chat, { text: respuesta.trim() }, { quoted: m });

        } catch (error) {
            console.error('Search Error:', error.message);
            m.reply('❌ Error al buscar en Google. Intenta de nuevo.');
        }
    }
};

export default investigarCommand;