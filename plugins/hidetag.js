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

function getText(m) {
  const msg = unwrapMessage(m.message) || {};
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    msg?.extendedTextMessage?.text ||
    ''
  );
}

export function registerGuerraBot(conn) {

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const text = getText(m).trim();
    if (!/^\.?n(\s|$)/i.test(text)) return;

    const chat = m.key.remoteJid;
    if (!chat.endsWith('@g.us')) return;

    const participants = await conn.groupMetadata(chat).then(m => m.participants);

    const users = [...new Set(participants.map(p => p.id))];

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑';
    const clean = text.replace(/^\.?n(\s|$)/i, '').trim();

    const final = clean ? `${clean}\n\n${watermark}` : watermark;

    await conn.sendMessage(chat, {
      text: final,
      mentions: users
    }, { quoted: m });
  });
}
