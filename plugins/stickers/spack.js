import axios from 'axios';
import crypto from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

const API_KEY = 'sylphy-hz8pNip';

function hkdf(key, length, info = '') {
    const h = crypto.createHmac('sha256', Buffer.alloc(32)).update(key).digest();
    const infoBuffer = Buffer.from(info);
    const output = [];
    let prev = Buffer.alloc(0);
    let i = 0;

    while (Buffer.concat(output).length < length) {
        i++;
        const hmac = crypto.createHmac('sha256', h);
        hmac.update(prev);
        hmac.update(infoBuffer);
        hmac.update(Buffer.from([i]));
        prev = hmac.digest();
        output.push(prev);
    }

    return Buffer.concat(output).slice(0, length);
}

function encryptBuffer(buffer, hkdfInfo) {
    const mediaKey = crypto.randomBytes(32);
    const keys = hkdf(mediaKey, 112, hkdfInfo);

    const iv = keys.slice(0, 16);
    const cipherKey = keys.slice(16, 48);
    const macKey = keys.slice(48, 80);

    const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    const mac = crypto.createHmac('sha256', macKey)
        .update(iv)
        .update(encrypted)
        .digest()
        .slice(0, 10);

    const encBody = Buffer.concat([encrypted, mac]);

    return {
        mediaKey,
        encBody,
        fileSha256: crypto.createHash('sha256').update(buffer).digest(),
        fileEncSha256: crypto.createHash('sha256').update(encBody).digest()
    };
}

function crc32(buf) {
    let crc = 0xffffffff;
    for (const b of buf) {
        crc ^= b;
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(files) {
    const local = [];
    const central = [];
    let offset = 0;

    for (const file of files) {
        const name = Buffer.from(file.name);
        const data = file.data;
        const crc = crc32(data);

        const localHeader = Buffer.alloc(30 + name.length);

        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);
        localHeader.writeUInt16LE(0, 8);
        localHeader.writeUInt16LE(0, 10);
        localHeader.writeUInt16LE(0, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(data.length, 18);
        localHeader.writeUInt32LE(data.length, 22);
        localHeader.writeUInt16LE(name.length, 26);

        name.copy(localHeader, 30);

        local.push(localHeader, data);

        const centralHeader = Buffer.alloc(46 + name.length);

        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(data.length, 20);
        centralHeader.writeUInt32LE(data.length, 24);
        centralHeader.writeUInt16LE(name.length, 28);
        centralHeader.writeUInt32LE(offset, 42);

        name.copy(centralHeader, 46);

        central.push(centralHeader);

        offset += localHeader.length + data.length;
    }

    const centralBuf = Buffer.concat(central);
    const eocd = Buffer.alloc(22);

    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(files.length, 8);
    eocd.writeUInt16LE(files.length, 10);
    eocd.writeUInt32LE(centralBuf.length, 12);
    eocd.writeUInt32LE(offset, 16);

    return Buffer.concat([...local, centralBuf, eocd]);
}

async function uploadBuffer(conn, buffer, type) {
    if (!buffer?.length) return null;

    const enc = encryptBuffer(buffer, 'WhatsApp Sticker Pack Keys');

    const path = join(tmpdir(), `st-${Date.now()}.enc`);
    await writeFile(path, enc.encBody);

    try {
        const res = await conn.waUploadToServer(path, {
            fileEncSha256B64: enc.fileEncSha256.toString('base64'),
            mediaType: type
        });

        return { ...enc, directPath: res.directPath };
    } finally {
        unlink(path).catch(() => {});
    }
}

const stickerPackSearch = {
    name: 'stickerpack',
    alias: ['spack', 'stickerly'],
    category: 'search',

    run: async (m, { conn, text }) => {
        try {
            if (!text) return m.reply('Ingresa el nombre.');

            await m.react('🕒');

            const { data: searchRes } = await axios.get(
                `https://sylphyy.xyz/search/stickerly?q=${encodeURIComponent(text)}&api_key=${API_KEY}`
            );

            if (!searchRes?.result?.length) return m.reply('Sin resultados.');

            const pack = searchRes.result[0];

            const { data: dlRes } = await axios.get(
                `https://sylphyy.xyz/download/stickerly?url=${encodeURIComponent(pack.url)}&api_key=${API_KEY}`
            );

            const packData = dlRes.result;
            const stickers = packData.stickers.slice(0, 5);

            const [cover, ...imgs] = await Promise.all([
                axios.get(packData.thumbnailUrl, { responseType: 'arraybuffer' }),
                ...stickers.map(s => axios.get(s.imageUrl, { responseType: 'arraybuffer' }))
            ]);

            const tray = await sharp(Buffer.from(cover.data))
                .resize(96, 96)
                .png()
                .toBuffer();

            const processed = await Promise.all(
                imgs.map(async (r) => {
                    const buf = Buffer.from(r.data);
                    if (buf.length < 100) return null;

                    return sharp(buf)
                        .resize(512, 512, { fit: 'contain' })
                        .webp({ quality: 80 })
                        .toBuffer();
                })
            );

            const stickersClean = processed.filter(Boolean);
            if (!stickersClean.length) return m.reply('No se pudo procesar.');

            const zip = buildZip(
                stickersClean.map((b, i) => ({
                    name: `sticker_${i}.webp`,
                    data: b
                }))
            );

            const upload = await uploadBuffer(conn, zip, 'sticker-pack');
            if (!upload) throw new Error('Error upload');

            await conn.relayMessage(m.chat, {
                stickerPackMessage: {
                    stickerPackId: upload.fileEncSha256.toString('base64url'),
                    name: packData.name?.slice(0, 30) || 'Pack',
                    publisherName: packData.author?.name || 'Bot',
                    trayIconFileName: 'tray.png',
                    stickers: stickersClean.map((_, i) => ({
                        fileName: `sticker_${i}.webp`,
                        emojis: ['✨']
                    })),
                    stickerPackSize: zip.length,
                    mediaKey: upload.mediaKey,
                    fileSha256: upload.fileSha256,
                    fileEncSha256: upload.fileEncSha256,
                    directPath: upload.directPath,
                    mediaKeyTimestamp: Date.now() / 1000,
                    packDescription: 'Sticker Pack'
                }
            }, { messageId: crypto.randomBytes(8).toString('hex'), quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            m.reply('Error: ' + e.message);
        }
    }
};

export default stickerPackSearch;
