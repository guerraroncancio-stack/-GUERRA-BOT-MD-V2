export function registerN(conn) {

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key?.fromMe) return;

    const chat = m.key.remoteJid;

    // Solo grupos
    if (!chat.endsWith('@g.us')) return;

    const msg = m.message || {};

    // 🔥 extractor real
    const text =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      msg.documentMessage?.caption ||
      '';

    const clean = (text || '').trim().toLowerCase();

    // 🔥 TRIGGER "n"
    if (clean !== 'n' && !clean.startsWith('n ')) return;

    // obtener participantes reales
    let participants = [];
    try {
      const meta = await conn.groupMetadata(chat);
      participants = meta.participants.map(p => p.id);
    } catch {
      participants = [];
    }

    const watermark = '> GUERRA 𝐁𝐎𝐓 👑';
    const finalText = clean === 'n' ? watermark : `${text.replace(/^n\s*/i, '')}\n\n${watermark}`;

    await conn.sendMessage(chat, {
      text: finalText,
      mentions: participants
    }, { quoted: m });

  });
}
