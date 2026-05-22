/* import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function bufferToWaveform(buffer) {
    const inputPath = join(tmpdir(), `audio_in_${Date.now()}.ogg`);
    const outputPath = join(tmpdir(), `audio_out_${Date.now()}.raw`);

    try {
        await writeFile(inputPath, buffer);

        await execAsync(
            `ffmpeg -y -i "${inputPath}" -f s16le -ac 1 -ar 16000 "${outputPath}"`
        );

        const raw = await readFile(outputPath);
        const samples = 64;
        const waveform = new Uint8Array(samples);
        const totalSamples = raw.length / 2;
        const step = Math.floor(totalSamples / samples);

        for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
                const idx = (i * step + j) * 2;
                if (idx + 1 < raw.length) {
                    const sample = raw.readInt16LE(idx);
                    sum += Math.abs(sample);
                }
            }
            waveform[i] = Math.min(255, Math.round((sum / step / 32768) * 255));
        }

        const max = Math.max(...waveform);
        if (max > 0) {
            for (let i = 0; i < samples; i++) {
                waveform[i] = Math.round((waveform[i] / max) * 255);
            }
        }

        return waveform;
    } finally {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
    }
}

const subirEstado = {
    name: 'story',
    alias: ['status', 'publicar'],
    category: 'owner',
    run: async (m, { conn, text }) => {
        const msg = m.quoted || m;
        const mime = (msg.msg || msg).mimetype || '';
        const isAudio = /audio/.test(mime);
        const isImage = /image/.test(mime);
        const isVideo = /video/.test(mime);

        if (!isImage && !isVideo && !isAudio) return m.reply('Etiqueta algo.');

        try {
            await m.react('🕒');
            const buffer = await msg.download();

            let content = {};
            if (isImage) {
                content = { image: buffer, caption: text || '' };
            } else if (isVideo) {
                content = { video: buffer, caption: text || '' };
            } else if (isAudio) {
                const waveform = await bufferToWaveform(buffer);
                content = {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: true,
                    waveform
                };
            }

            const chats = await conn.groupFetchAllParticipating().catch(() => ({}));
            const statusJidList = Object.values(chats).flatMap(g => g.participants.map(p => p.id));

            await conn.sendMessage('status@broadcast', content, {
                broadcast: true,
                statusJidList: [...new Set(statusJidList)],
                backgroundColor: '#000000',
                font: 1
            });

            await m.react('✅');
        } catch (e) {
            console.error(e);
            await m.react('✖️');
        }
    }
};

export default subirEstado;
*/
