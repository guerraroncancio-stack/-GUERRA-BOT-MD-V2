import axios from 'axios';
import crypto from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

const API_KEY = 'sylphy-hz8pNip';

/* =========================
   CRYPTO HELPERS
========================= */

function hkdf(key, length, info = '') {
    const h = crypto.createHmac('sha256', Buffer.alloc(32)).update(key).digest();
    const infoBuffer = Buffer.from(info);

    let prev = Buffer.alloc(0);
    let out = Buffer.alloc(0);
    let i = 0;

    while (out.length < length) {
        i++;
        const hmac = crypto.createHmac('sha256', h);
        hmac.update(prev);
        hmac.update(infoBuffer);
        hmac.update(Buffer.from([i]));
        prev = hmac.digest();
        out = Buffer.concat([out, prev]);
    }

    return out.slice(0, length);
}

function encryptBuffer(buffer, hkdfInfo) {
    const mediaKey = crypto.randomBytes(32);
    const keys = hkdf(mediaKey, 112, hkdfInfo);

    const iv = keys.subarray(0, 16);
    const cipherKey = keys.subarray(16, 48);
    const macKey = keys.subarray(48, 80);

    const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
    const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);

    const mac = crypto.createHmac('sha256', macKey)
        .update(iv)
        .update(enc)
        .digest()
        .subarray(0, 10);

    const encBody = Buffer.concat([enc, mac]);

    return {
        mediaKey,
        encBody,
        fileSha256: crypto.createHash('sha256').update(buffer).digest(),
        fileEncSha256: crypto.createHash('sha256').update(encBody).digest()
    };
}

/* =========================
   ZIP BUILDER
========================= */

function crc32(buf) {
    let crc = 0xffffffff;

    for (const b of buf) {
        crc ^= b;
        for (let i = 0; i < 8; i++) {
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
        const crc = crc32(file.data);

        const header = Buffer.alloc(30 + name.length);

        header.writeUInt32LE(0x04034b50, 0);
        header.writeUInt16LE(20, 4);
        header.writeUInt32LE(crc, 14);
        header.writeUInt32LE(file.data.length, 18);
        header.writeUInt32LE(file.data.length, 22);
        header.writeUInt16LE(name.length, 26);

        name.copy(header, 30);

        local.push(header, file.data);

        const cd = Buffer.alloc(46 + name.length);
        cd.writeUInt32LE(0x02014b50, 0);
        cd.writeUInt32LE(crc, 16);
        cd.writeUInt32LE(file.data.length, 20);
        cd.writeUInt32LE(file.data.length, 24);
        cd.writeUInt16LE(name.length, 28);
        cd.writeUInt32LE(offset, 42);

        name.copy(cd, 46);

        central.push(cd);
        offset += header.length + file.data.length;
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

/* =========================
   PATCH BAILEYS
========================= */

let patched = false;

async function patchMediaPathMap() {
    if (patched) return;

    try {
        const defaults = await import(
            '/home/container/node_modules/@whiskeysockets/baileys/lib/Defaults/index.js'
        );

        defaults.MEDIA_PATH_MAP['sticker-pack'] = '/mms/sticker-pack';
        defaults.MEDIA_HKDF_KEY_MAPPING['sticker-pack'] = 'Sticker Pack';

        patched = true;
    } catch (e) {
        console.error('[patchMediaPathMap]', e.message);
    }
}

/* =========================
   UPLOAD
========================= */

async function uploadBuffer(conn, buffer, mediaType) {
    if (!buffer?.length) return null;

    const enc = encryptBuffer(
        buffer,
        mediaType === 'sticker'
            ? 'WhatsApp Image Keys'
            : 'WhatsApp Sticker Pack Keys'
    );

    const file = join(tmpdir(), `wa_${Date.now()}.enc`);

    await writeFile(file, enc.encBody);

    try {
        const res = await conn.waUploadToServer(file, {
            fileEncSha256B64: enc.fileEncSha256.toString('base64'),
            mediaType
        });

        return { ...enc, directPath: res.directPath };
    } finally {
        unlink(file).catch(() => {});
    }
}

/* =========================
   COMMAND
========================= */

const stickerPackSearch = {
    name: 'stickerpack',
    alias: ['spack', 'stickerly'],
    category: 'search',

    run: async (m, { conn, text }) => {
        if (!text)
            return m.reply('❗ Ingresa un nombre para buscar el pack.');

        try {
            await m.react('🕒');
            await patchMediaPathMap();

            const search = await axios.get(
                `https://sylphyy.xyz/search/stickerly?q=${encodeURIComponent(text)}&api_key=${API_KEY}`
            );

            const pack = search.data?.result?.[0];

            if (!pack)
                return m.reply('❌ No se encontraron resultados.');

            const dl = await axios.get(
                `https://sylphyy.xyz/download/stickerly?url=${encodeURIComponent(pack.url)}&api_key=${API_KEY}`
            );

            const data = dl.data?.result;

            if (!data?.stickers)
                return m.reply('❌ Error al descargar el paquete.');

            const stickers = data.stickers.slice(0, 5);

            const [cover, ...imgs] = await Promise.all([
                axios.get(data.thumbnailUrl, { responseType: 'arraybuffer' }),
                ...stickers.map(s =>
                    axios.get(s.imageUrl, { responseType: 'arraybuffer' })
                )
            ]);

            const tray = await sharp(Buffer.from(cover.data))
                .resize(96, 96)
                .png()
                .toBuffer();

            const processed = await Promise.all(
                imgs.map(async (r, i) => {
                    try {
                        return await sharp(Buffer.from(r.data))
                            .resize(512, 512, { fit: 'contain' })
                            .webp({ quality: 80 })
                            .toBuffer();
                    } catch {
                        return null;
                    }
                })
            );

            const clean = processed.filter(Boolean);

            if (!clean.length)
                return m.reply('❌ No se pudieron procesar stickers.');

            const files = clean.map((buf, i) => ({
                name: `sticker_${i}.webp`,
                data: buf
            }));

            const zip = buildZip(files);
            const upload = await uploadBuffer(conn, zip, 'sticker-pack');

            if (!upload)
                return m.reply('❌ Error subiendo el pack.');

            await conn.relayMessage(m.chat, {
                stickerPackMessage: {
                    name: `✨ ${data.name || 'Pack'}`,
                    publisherName: data.author?.name || 'Bot',
                    stickers: [],
                    mediaKey: upload.mediaKey,
                    fileEncSha256: upload.fileEncSha256,
                    fileSha256: upload.fileSha256,
                    directPath: upload.directPath
                }
            }, { quoted: m });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};

export default stickerPackSearch;
