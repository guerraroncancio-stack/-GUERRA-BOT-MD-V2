export async function setWelcomeLogic(m, conn, text, command) {

  if (!m.isGroup) return;

  // 🔥 reacción segura
  await conn.sendMessage(m.chat, {
    react: { text: '🙌🏻', key: m.key }
  });

  // =========================
  // FAKE CONTACT QUOTED
  // =========================
  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:Bot
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  };

  // =========================
  // DB SAFE
  // =========================
  global.db = global.db || {};
  global.db.data = global.db.data || {};
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};

  const cmd = (command || '').toLowerCase();
  const isSet = cmd === 'setwelcome' || cmd === 'bienvenida';
  const isDel = cmd === 'delwelcome';

  // =========================
  // SET WELCOME
  // =========================
  if (isSet) {

    if (text?.trim()) {
      global.db.data.chats[m.chat].sWelcome = text.trim();

      return conn.sendMessage(m.chat, {
        text: '𝘽𝙄𝙀𝙉𝙑𝙀𝙉𝙄𝘿𝘼 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝘿𝘼 ✔️'
      }, { quoted: fkontak });
    }

    return conn.sendMessage(m.chat, {
      text: `𝙀𝙎𝘾𝙍𝙄𝘽𝙀 𝙀𝙇 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 𝘿𝙀 𝘽𝙄𝙀𝙉𝙑𝙀𝙉𝙄𝘿𝘼

Ej:
Hola @user bienvenido a @group`
    }, { quoted: fkontak });
  }

  // =========================
  // DELETE WELCOME
  // =========================
  if (isDel) {

    if (global.db.data.chats[m.chat].sWelcome) {
      delete global.db.data.chats[m.chat].sWelcome;

      return conn.sendMessage(m.chat, {
        text: '𝘽𝙄𝙀𝙉𝙑𝙀𝙉𝙄𝘿𝘼 𝙍𝙀𝙎𝙏𝘼𝘽𝙇𝙀𝘾𝙄𝘿𝘼 ✔️'
      }, { quoted: fkontak });
    }

    return conn.sendMessage(m.chat, {
      text: '𝙉𝙊 𝙃𝘼𝙔 𝘽𝙄𝙀𝙉𝙑𝙀𝙉𝙄𝘿𝘼 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝘿𝘼 ❌'
    }, { quoted: fkontak });
  }
}
