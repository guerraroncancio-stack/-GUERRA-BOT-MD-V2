import yts from 'yt-search';
import fetch from 'node-fetch';
import { generateWAMessageContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import axios from 'axios';
import sharp from 'sharp';

const youtubeCommand = {
    name: 'youtube_play',
    alias: ['play', 'audio', 'mp3', 'video', 'mp4', 'play2', 'playaudio', 'playvideo'],
    category: 'download',
    run: async (m, { conn, text, command, usedPrefix }) => {

        if (!text?.trim()) {
            return conn.reply(
                m.chat,
                `╭─〔 🎬 YOUTUBE DOWNLOADER 〕─╮\n│ Uso: ${usedPrefix + command} <búsqueda o link>\n╰──────────────────────╯`,
                m
            );
        }

        const isAudio = /play$|audio|mp3|ytmp3|playaudio/i.test(command);
        const isDocument = /play2$/i.test(command);
        const apiKey = 'kirito-bot-oficial';

        await m.react("⌛");

        try {
            const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
            const searchPromise = videoMatch
                ? yts({ videoId: videoMatch[1] })
                : yts(text).then(s => s.videos?.[0]);

            const videoSearchResult = await searchPromise;

            if (!videoSearchResult) {
                return conn.reply(m.chat, `❌ No se encontraron resultados.`, m);
            }

            const videoUrl = `https://www.youtube.com/watch?v=${videoSearchResult.videoId}`;
            const thumbUrl = videoSearchResult.image || videoSearchResult.thumbnail;

            const thumbBufferPromise = fetch(thumbUrl)
                .then(res => res.buffer())
                .then(buf =>
                    sharp(buf)
                        .resize(250, 250, { fit: 'cover' })
                        .jpeg({ quality: 70 })
                        .toBuffer()
                );

            const apiResponsePromise = fetch(
                `https://panel.apinexus.fun/api/youtube/${isAudio ? 'mp3' : 'mp4'}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey
                    },
                    body: JSON.stringify({ url: videoUrl })
                }
            ).then(res => res.json());

            const [thumbBuffer, apiResponse] = await Promise.all([
                thumbBufferPromise,
                apiResponsePromise
            ]);

            const infoText =
`╭─〔 🎧 YOUTUBE RESULT 〕─╮
│ 📌 Título: ${videoSearchResult.title}
│ 👤 Canal: ${videoSearchResult.author?.name || 'Desconocido'}
│ ⏱ Duración: ${videoSearchResult.timestamp || '---'}
│ 👁 Vistas: ${videoSearchResult.views?.toLocaleString() || '---'}
│ 🔗 Link: ${videoUrl}
╰──────────────────────╯`;

            await conn.sendMessage(m.chat, {
                image: { url: thumbUrl },
                caption: infoText,
                contextInfo: { ...global.channelInfo }
            }, { quoted: m });

            if (!apiResponse.success) throw new Error("API fallida");

            const downloadUrl = isAudio
                ? apiResponse.data.audio
                : apiResponse.data.video;

            const checkSize = await fetch(downloadUrl, { method: 'HEAD' });
            const sizeInBytes = parseInt(checkSize.headers.get('content-length') || '0');

            if (sizeInBytes > 10 * 1024 * 1024) {
                return conn.reply(m.chat, `⚠️ El archivo supera los 10MB.`, m);
            }

            if (isAudio) {
                await conn.sendMessage(m.chat, {
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg",
                    fileName: `${videoSearchResult.title}.mp3`
                }, { quoted: m });
            } else {
                const mediaBuffer = await fetch(downloadUrl).then(res => res.buffer());

                await conn.sendMessage(m.chat, {
                    video: mediaBuffer,
                    mimetype: "video/mp4",
                    caption: `🎬 ${videoSearchResult.title}\n🔗 ${videoUrl}`
                }, { quoted: m });
            }

            await m.react("✅");

        } catch (error) {
            console.error(error);
            await m.react("❌");
            conn.reply(m.chat, `❌ Error: ${error.message}`, m);
        }
    }
};

export default youtubeCommand;
