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
        if (!text?.trim()) return conn.reply(m.chat, `ᰔᩚ   *KIRITO DOWNLOAD* ᥫᩣ\n\n*Uso:* ${usedPrefix + command} <búsqueda>`, m);

        const isAudio = /play$|audio$|mp3|ytmp3|playaudio/i.test(command);
        const isDocument = /play$|play2$/i.test(command);
        const apiKey = 'kirito-bot-oficial';

        await m.react("⌛"); 

        try {
            const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([id=a-zA-Z0-9_-]{11})/);
            const searchPromise = videoMatch ? yts({ videoId: videoMatch[1] }) : yts(text).then(s => s.videos?.[0]);

            const videoSearchResult = await searchPromise;
            if (!videoSearchResult) return conn.reply(m.chat, "No se hallaron resultados.", m);

            const videoUrl = 'https://www.youtube.com/watch?v=' + videoSearchResult.videoId;
            const thumbUrl = videoSearchResult.image || videoSearchResult.thumbnail;

            const thumbBufferPromise = fetch(thumbUrl)
                .then(res => res.buffer())
                .then(buf => sharp(buf)
                    .resize(200, 200, { fit: 'cover' })
                    .jpeg({ quality: 60 })
                    .toBuffer()
                );

            const apiResponsePromise = fetch(`https://panel.apinexus.fun/api/youtube/${isAudio ? 'mp3' : 'mp4'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                body: JSON.stringify({ url: videoUrl })
            }).then(res => res.json());

            const [thumbBuffer, apiResponse] = await Promise.all([thumbBufferPromise, apiResponsePromise]);

            const infoText = `\n\t\t\t\t*♬♫ YOUTUBE DOWNLOAD 𝄞*\n\n✰ *TÍTULO:* ${videoSearchResult.title}\n♛ *CANAL:* ${videoSearchResult.author?.name || '---'}\n✎ *TIEMPO:* ${videoSearchResult.timestamp || '---'}\n⌬ *VISTAS:* ${videoSearchResult.views?.toLocaleString() || '---'}\n▢ *LINK:* ${videoUrl}\n`;

            conn.sendMessage(m.chat, { 
                image: { url: thumbUrl }, 
                caption: infoText,
                contextInfo: { ...global.channelInfo }
            }, { quoted: m });

            if (!apiResponse.success) throw new Error("API Fallida");
            const downloadUrl = isAudio ? apiResponse.data.audio : apiResponse.data.video;

            const checkSize = await fetch(downloadUrl, { method: 'HEAD' });
            const sizeInBytes = parseInt(checkSize.headers.get('content-length') || '0');
            if (sizeInBytes > 10 * 1024 * 1024) {
                return conn.reply(m.chat, `⚠️ Supera los 10MB.`, m);
            }

            if (isAudio) {
                const audioPayload = {
                    mimetype: "audio/mpeg",
                    fileName: `${videoSearchResult.title}.mp3`
                };
                if (isDocument) {
                    await conn.sendMessage(m.chat, { document: { url: downloadUrl }, ...audioPayload, jpegThumbnail: thumbBuffer }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, { audio: { url: downloadUrl }, ...audioPayload }, { quoted: m });
                }
            } else {
                if (isDocument) {
                    await conn.sendMessage(m.chat, {
                        document: { url: downloadUrl },
                        mimetype: "video/mp4",
                        fileName: `${videoSearchResult.title}.mp4`,
                        jpegThumbnail: thumbBuffer,
                        caption: videoSearchResult.title
                    }, { quoted: m });
                } else {
                    const mediaBuffer = await fetch(downloadUrl).then(res => res.buffer());
                    const instagramShortcode = "DXF25DKDZrN";

                    const [uploadedArt, messageContent] = await Promise.all([
                        prepareWAMessageMedia({ image: thumbBuffer }, { upload: conn.waUploadToServer }),
                        generateWAMessageContent({ video: mediaBuffer, mimetype: 'video/mp4', jpegThumbnail: thumbBuffer }, { upload: conn.waUploadToServer })
                    ]);

                    await conn.relayMessage(m.chat, {
                        videoMessage: {
                            ...messageContent.videoMessage,
                            jpegThumbnail: thumbBuffer.toString('base64'),
                            thumbnailWidth: 480,
                            thumbnailHeight: 480,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: global.ch || '',
                                    newsletterName: 'Kirito ♕ — Official Channel ™'
                                }
                            },
                            annotations: [{
                                polygonVertices: [{ x: 0.25, y: 0.41 }, { x: 0.75, y: 0.41 }, { x: 0.75, y: 0.58 }, { x: 0.25, y: 0.58 }],
                                shouldSkipConfirmation: true,
                                embeddedContent: {
                                    embeddedMusic: {
                                        musicContentMediaId: instagramShortcode,
                                        songId: instagramShortcode,
                                        author: videoSearchResult.author?.name || 'Deylin Tech',
                                        title: videoSearchResult.title || 'KIRITO MUSIC',
                                        artistAttribution: `https://www.instagram.com/p/${instagramShortcode}/`,
                                        artworkDirectPath: uploadedArt.imageMessage.directPath,
                                        artworkMediaKey: uploadedArt.imageMessage.mediaKey,
                                        artworkSha256: uploadedArt.imageMessage.fileSha256,
                                        artworkEncSha256: uploadedArt.imageMessage.fileEncSha256,
                                        isExplicit: false,
                                        musicSongStartTimeInMs: 0,
                                        derivedContentStartTimeInMs: 0,
                                        overlapDurationInMs: 30000
                                    }
                                },
                                embeddedAction: true
                            }]
                        }
                    }, { quoted: m });
                }
            }
            await m.react("✅");
        } catch (error) {
            conn.reply(m.chat, `*Error:* ${error.message}`, m);
            await m.react("❌");
        }
    }
};

export default youtubeCommand;
