import axios from 'axios';
import crypto from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

const API_KEY = 'sylphy-hz8pNip';

/* =========================
   HKDF
========================= */
function hkdf(key, length, info = '') {
    const h = crypto.createHmac('sha256', Buffer.alloc(32)).update(key).digest();
    const infoBuffer = Buffer.from(info);
    const output = [];
    let prev = Buffer.alloc(0);
    let done = 0;
    let i = 0;

    while (done < length) {
        i++;
        const hmac = crypto.createHmac('sha256', h);
        hmac.update(prev);
        hmac.update(infoBuffer);
        hmac.update(Buffer.from([i]));
        prev = hmac.digest();
        output.push(prev);
        done += prev.length;
    }

    return Buffer.concat(output).slice(0, length);
}

/* =========================
   ENCRYPT
========================= */
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

/* =========================
   ZIP BUILDER
========================= */
function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const b of buf) {
        crc ^= b;
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
    const localParts = [];
    const centralDirs = [];
    let offset = 0;

    for (const file of files) {
        const name = Buffer.from(file.name);
        const data = file.data;
        const crc = crc32(data);

        const local = Buffer.alloc(30 + name.length);

        local.writeUInt32LE(0x04034b50, 0);
        local.writeUInt16LE(20, 4);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(data.length, 18);
        local.writeUInt32LE(data.length, 22);
        local.writeUInt16LE(name.length, 26);

        name.copy(local, 30);

        localParts.push(local, data);

        const cd = Buffer.alloc(46 + name.length);

        cd.writeUInt32LE(0x02014b50, 0);
        cd.writeUInt32LE(crc, 16);
        cd.writeUInt32LE(data.length, 20);
        cd.writeUInt32LE(data.length, 24);
        cd.writeUInt16LE(name.length, 28);
        cd.writeUInt32LE(offset, 42);

        name.copy(cd, 46);

        centralDirs.push(cd);
        offset += local.length + data.length;
    }

    const central = Buffer.concat(centralDirs);
    const eocd = Buffer.alloc(22);

    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(files.length, 8);
    eocd.writeUInt32LE(central.length, 12);
    eocd.writeUInt32LE(offset, 16);

    return Buffer.concat([...localParts, central, eocd]);
}

/* =========================
   UPLOAD SAFE
========================= */
async function uploadBuffer(conn, buffer, mediaType) {
    if (!buffer || buffer.length < 50) return null;

    const enc = encryptBuffer(
        buffer,
        mediaType === 'sticker'
            ? 'WhatsApp Image Keys'
            : 'WhatsApp Sticker Pack Keys'
    );

    const tmpPath = join(tmpdir(), `wa-${Date.now()}.enc`);

    await writeFile(tmpPath, enc.encBody);

    try {
        const result = await conn.waUploadToServer(tmpPath, {
            fileEncSha256B64: enc.fileEncSha256.toString('base64'),
            mediaType
        });

        return { ...enc, directPath: result.directPath };
    } catch (e) {
        return null;
    } finally {
        unlink(tmpPath).catch(() => {});
    }
}

/* =========================
   PATCH BAILEYS
========================= */
async function patchMediaPathMap() {
    try {
        const defaults = await import(
            '/home/container/node_modules/@whiskeysockets/baileys/lib/Defaults/index.js'
        );

        defaults.MEDIA_PATH_MAP['sticker-pack'] = '/mms/sticker-pack';
        defaults.MEDIA_HKDF_KEY_MAPPING['sticker-pack'] = 'Sticker Pack';
    } catch {}
}

/* =========================
   MAIN COMMAND
========================= */
const stickerPackSearch = {
    name: 'stickerpack',
    alias: ['spack', 'stickerly'],
    category: 'search',

    run: async (m, { conn, text }) => {
        if (!text) return m.reply('❌ Ingresa un nombre de pack.');

        try {
            await m.react('🕒');
            await patchMediaPathMap();

            /* =========================
               SEARCH
            ========================= */
            let searchRes;
            try {
                const res = await axios.get(
                    `https://sylphyy.xyz/search/stickerly?q=${encodeURIComponent(text)}&api_key=${API_KEY}`
                );
                searchRes = res.data;
            } catch {
                return m.reply('❌ Error en búsqueda.');
            }

            if (!searchRes?.status || !searchRes?.result?.length) {
                return m.reply('❌ Sin resultados.');
            }

            const pack = searchRes.result[0];

            /* =========================
               DOWNLOAD SAFE (FIX 500)
            ========================= */
            let dlRes;
            try {
                const res = await axios.get(
                    `https://sylphyy.xyz/download/stickerly?url=${encodeURIComponent(pack.url)}&api_key=${API_KEY}`
                );
                dlRes = res.data;
            } catch {
                return m.reply('❌ La API falló (error 500 externo).');
            }

            if (!dlRes?.status || !dlRes?.result?.stickers) {
                return m.reply('❌ Pack inválido o roto.');
            }

            const packData = dlRes.result;

            if (!Array.isArray(packData.stickers)) {
                return m.reply('❌ No hay stickers en este pack.');
            }

            const stickersToProcess = packData.stickers.slice(0, 5);

            /* =========================
               DOWNLOAD IMAGES SAFE
            ========================= */
            const [coverRes, ...stickerResps] = await Promise.all([
                axios.get(packData.thumbnailUrl, { responseType: 'arraybuffer' }).catch(() => null),
                ...stickersToProcess.map(s =>
                    axios.get(s.imageUrl, { responseType: 'arraybuffer' }).catch(() => null)
                )
            ]);

            if (!coverRes?.data) {
                return m.reply('❌ Error en portada del pack.');
            }

            const trayBuffer = await sharp(Buffer.from(coverRes.data))
                .resize(96, 96)
                .png()
                .toBuffer()
                .catch(() => null);

            if (!trayBuffer) return m.reply('❌ Error procesando portada.');

            /* =========================
               PROCESS STICKERS SAFE
            ========================= */
            const processedStickers = (
                await Promise.all(
                    stickerResps.map(async (resp) => {
                        try {
                            if (!resp?.data) return null;

                            return await sharp(Buffer.from(resp.data))
                                .resize(512, 512, {
                                    fit: 'contain',
                                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                                })
                                .webp({ quality: 75 })
                                .toBuffer();
                        } catch {
                            return null;
                        }
                    })
                )
            ).filter(Boolean);

            if (!processedStickers.length) {
                return m.reply('❌ No se pudo procesar ningún sticker.');
            }

            /* =========================
               BUILD ZIP
            ========================= */
            const zipFiles = [];

            for (let i = 0; i < processedStickers.length; i++) {
                const hash = crypto
                    .createHash('sha256')
                    .update(processedStickers[i])
                    .digest('base64url');

                zipFiles.push({
                    name: `${i}_${hash}.webp`,
                    data: processedStickers[i]
                });
            }

            const finalZip = buildZip(zipFiles);
            const upload = await uploadBuffer(conn, finalZip, 'sticker-pack');

            if (!upload) return m.reply('❌ Error subiendo pack.');

            /* =========================
               SEND
            ========================= */
            await conn.sendMessage(
                m.chat,
                {
                    sticker: trayBuffer
                },
                { quoted: m }
            );

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            m.reply('❌ Error general en stickerpack.');
        }
    }
};

export default stickerPackSearch;
