import { randomBytes } from "crypto";
import fluent_ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import { Readable } from "stream";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink, readFile } from "fs/promises";

async function addExif(webpBuffer, packname, author, categories = ["🤩"], extra = {}) {
    const img = new webp.Image();
    const json = {
        "sticker-pack-id": randomBytes(32).toString("hex"),
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: categories,
        ...extra,
    };
    const exifAttr = Buffer.from([
        0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,
        0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
        0x00,0x00,0x16,0x00,0x00,0x00,
    ]);
    const jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuf]);
    exif.writeUIntLE(jsonBuf.length, 14, 4);
    await img.load(webpBuffer);
    img.exif = exif;
    return img.save(null);
}

function convertToWebP(inputBuffer, isVideo) {
    return isVideo
        ? convertVideoToWebP(inputBuffer)
        : convertImageToWebP(inputBuffer);
}

function convertImageToWebP(inputBuffer) {
    return new Promise((resolve, reject) => {
        const src = new Readable({ read() {} });
        const chunks = [];

        src.push(inputBuffer);
        src.push(null);

        fluent_ffmpeg(src)
            .inputFormat("image2pipe")
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,pad=320:320:-1:-1:color=0x00000000",
                "-pix_fmt", "rgba",
                "-lossless", "1",
                "-quality", "90",
                "-compression_level", "3",
                "-an",
                "-vsync", "0",
                "-frames:v", "1",
            ])
            .toFormat("webp")
            .on("error", reject)
            .pipe()
            .on("data", c => chunks.push(c))
            .on("end", () => {
                const buf = Buffer.concat(chunks);
                buf.length < 100
                    ? reject(new Error("WebP de imagen corrupto"))
                    : resolve(buf);
            })
            .on("error", reject);
    });
}

async function convertVideoToWebP(inputBuffer) {
    const id = randomBytes(8).toString("hex");
    const inPath = join(tmpdir(), `sk_in_${id}`);
    const outPath = join(tmpdir(), `sk_out_${id}.webp`);

    const cleanup = () => Promise.all([
        unlink(inPath).catch(() => {}),
        unlink(outPath).catch(() => {}),
    ]);

    await writeFile(inPath, inputBuffer);

    await new Promise((resolve, reject) => {
        fluent_ffmpeg(inPath)
            .addOutputOptions([
                "-vcodec", "libwebp_anim",
                "-vf", [
                    "fps=15",
                    "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease",
                    "pad=320:320:-1:-1:color=0x00000000",
                ].join(","),
                "-pix_fmt", "yuva420p",
                "-loop", "0",
                "-quality", "50",
                "-compression_level", "1",
                "-lossless", "0",
                "-an",
                "-vsync", "0",
                "-t", "7",
            ])
            .output(outPath)
            .on("end", resolve)
            .on("error", reject)
            .run();
    }).catch(async err => {
        await cleanup();
        throw err;
    });

    const result = await readFile(outPath);
    await cleanup();

    if (result.length < 100) throw new Error("WebP animado corrupto tras FFmpeg");
    return result;
}

const stickerCommand = {
    name: "sticker",
    alias: ["s", "stiker"],
    category: "tools",

    run: async (m, { conn, args }) => {
        try {
            const q = m.quoted ?? m;
            const mime = (q.msg ?? q).mimetype ?? "";
            const txt = args.join(" ");

            if (!/image|video|webp/.test(mime))
                return m.reply("> *✎ Responde a una imagen o video para procesar.*");

            if (/video/.test(mime)) {
                const duration = q.msg?.seconds ?? q.seconds ?? 0;
                if (duration > 7) {
                    await m.react("❌");
                    return m.reply("> *⍰ El video es demasiado largo (máximo 7s).*");
                }
            }

            await m.react("🕓");

            const buffer = await q.download();
            if (!buffer) return m.reply("> ⚔ Error al descargar el archivo.");

            const type = await fileTypeFromBuffer(buffer) ?? { mime: "image/jpeg" };
            const isVideo = /video|gif/.test(type.mime);

            const webpBuf = await convertToWebP(buffer, isVideo);
            const botName = typeof global.botname === "string" ? global.botname : "Kirito-Bot";
            const userName = m.pushName ?? "User";
            const [pack, auth] = txt.includes("|")
                ? txt.split("|").map(v => v.trim())
                : [botName, userName];

            const sticker = await addExif(webpBuf, pack, auth);

            await conn.sendMessage(
                m.chat,
                {
                    sticker,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        ...(global.channelInfo ?? {}),
                    },
                },
                { quoted: m }
            );

            await m.react("✅");

        } catch (err) {
            console.error("[sticker]", err);
            await m.react("❌");
            await m.reply(`> ⚔ Error al crear el sticker:\n${err.message}`);
        }
    },
};

export default stickerCommand;