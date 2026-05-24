import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

let thumb = null
fetch('https://api.dix.lat/media2/1777604199636.jpg')
  .then(r => r.arrayBuffer())
  .then(buf => thumb = Buffer.from(buf))
  .catch(() => null)

function unwrapMessage(m = {}) {
  let n = m;
  while (
    n?.viewOnceMessage?.message ||
    n?.viewOnceMessageV2?.message ||
    n?.viewOnceMessageV2Extension?.message ||
    n?.ephemeralMessage?.message
  ) {
    n =
      n.viewOnceMessage?.message ||
      n.viewOnceMessageV2?.message ||
      n.viewOnceMessageV2Extension?.message ||
      n.ephemeralMessage?.message;
  }
  return n;
}

function getMessageText(m) {
  const msg = unwrapMessage(m.message) || {};
  return (
    m.text ||
    m.msg?.caption ||
    msg?.extendedTextMessage?.text ||
    msg?.conversation ||
    ''
  );
}

async function downloadMedia(msgContent, type) {
  try {
    const stream = await downloadContentFromMessage(msgContent, type);
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  } catch {
    return null;
  }
}

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup || m.key.fromMe) return;

  const fkontak = {
    key: {
      remoteJid: m.chat,
      fromMe: false,
      id: '𝕵uan'
    },
    message: {
      locationMessage: {
        name: 'Hola, Soy GUERRA 𝐁𝐎𝐓',
        jpegThumbnail: thumb
      }
    },
    participant: '0@s.whatsapp.net'
  };

  const content = getMessageText(m);
  if (!/^\.?n(\s|$)/i.test(content.trim())) return;

  await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });

  const users = [...new Set(participants.map(p => conn.decodeJid(p.id)))];

  const q = m.quoted ? unwrapMessage(m.quoted) : unwrapMessage(m);
  const mtype = q.mtype || Object.keys(q.message || {})[0] || '';

  const isMedia = [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'stickerMessage'
  ].includes(mtype);

  const userText = content.trim().replace(/^\.?n(\s|$)/i, '');
  const originalCaption = (q.msg?.caption || q.text || '').trim();
  const watermark = '> GUERRA 𝐁𝐎𝐓 👑';

  const finalCaption =
    userText ? `${userText}\n\n${watermark}` :
    originalCaption ? `${originalCaption}\n\n${watermark}` :
    watermark;

  try {

    if (isMedia) {
      let buffer = null;

      if (q[mtype]) {
        const detected = mtype.replace('Message', '').toLowerCase();
        buffer = await downloadMedia(q[mtype], detected);
      }

      if (!buffer && q.download) buffer = await q.download();

      if (mtype === 'audioMessage') {
        await conn.sendMessage(m.chat, {
          audio: buffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          mentions: users
        }, { quoted: fkontak });

        return;
      }

      if (mtype === 'imageMessage') {
        return await conn.sendMessage(m.chat, {
          image: buffer,
          caption: finalCaption,
          mentions: users
        }, { quoted: fkontak });
      }

      if (mtype === 'videoMessage') {
        return await conn.sendMessage(m.chat, {
          video: buffer,
          caption: finalCaption,
          mimetype: 'video/mp4',
          mentions: users
        }, { quoted: fkontak });
      }

      if (mtype === 'stickerMessage') {
        return await conn.sendMessage(m.chat, {
          sticker: buffer,
          mentions: users
        }, { quoted: fkontak });
      }
    }

    // ✅ HIDETAG REAL FUNCIONAL (FIX PRINCIPAL)
    return await conn.sendMessage(
      m.chat,
      {
        text: finalCaption,
        mentions: users
      },
      { quoted: fkontak }
    );

  } catch (err) {
    return await conn.sendMessage(
      m.chat,
      {
        text: '> GUERRA 𝐁𝐎𝐓 👑',
        mentions: users
      },
      { quoted: fkontak }
    );
  }
};

handler.help = ["𝖭𝗈𝗍𝗂𝖿𝗒"];
handler.tags = ["𝖦𝖱𝖴𝖯𝖮𝖲"];
handler.customPrefix = /^\.?n(\s|$)/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;
