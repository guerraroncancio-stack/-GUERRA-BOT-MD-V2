import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

export async function before(m, { conn, participants}) {
  if (!m.messageStubType || !m.isGroup) return

  let usuario = `@${m.sender.split`@`[0]}`

  let pp = await conn.getFile('https://api.dix.lat/media2/1777604199636.jpg')
    .then(r => r.data)

  let fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'JirenBot'
    },
    message: {
      locationMessage: {
        name: '𝙂𝙐𝙀𝙍𝙍𝘼 𝘽𝙊𝙏 👑',
        jpegThumbnail: pp
      }
    },
    participant: '0@s.whatsapp.net'
  }

  let chat = global.db.data.chats[m.chat]
  let users = participants.map(u => conn.decodeJid(u.id))
  const groupAdmins = participants.filter(p => p.admin)
  const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n')

  if (chat.detect && m.messageStubType == 2) {
    const chatId = m.isGroup ? m.chat : m.sender;
    const uniqid = chatId.split('@')[0];
    const sessionCandidates = [
      `./${global.sessions || 'Session'}/`,
      './Session/',
      './session/'
    ];
    const sessionPath = sessionCandidates.find(p => existsSync(p));
    if (!sessionPath) return;

    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file.includes(uniqid)) {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }
  } else if (chat.detect && m.messageStubType == 21) {
    await this.sendMessage(m.chat, { text: `${usuario} \`𝐂𝐀𝐌𝐁𝐈𝐎 𝐄𝐋 𝐍𝐎𝐌𝐁𝐑𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 𝐀:\`\n\n> *${m.messageStubParameters[0]}*`, mentions: [m.sender, ...groupAdmins.map(v => v.id)] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 22) {
    await this.sendMessage(m.chat, { text: `${usuario} \`𝐇𝐀 𝐂𝐀𝐌𝐁𝐈𝐀𝐃𝐎 𝐋𝐀 𝐅𝐎𝐓𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 🏘️\``, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100}) 
  } else if (chat.detect && m.messageStubType == 24) {
    await this.sendMessage(m.chat, { text: `${usuario} \`𝐂𝐀𝐌𝐁𝐈𝐎 𝐋𝐀 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈𝐎𝐍 𝐍𝐔𝐄𝐕𝐀 🛸\`\n\n> ${m.messageStubParameters[0]}`, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 25) {
    await this.sendMessage(m.chat, { text: `\`🎰 𝐀𝐇𝐎𝐑𝐀 🎰\`\n\n> *${m.messageStubParameters[0] == 'on' ? 'ꇙꄲ꒒ꄲ ᥲძmіᥒs' : '𝗍᥆ძ᥆s'}*⍴ᥙᥱძᥱᥒ ᥱძі𝗍ᥲr ᥣᥲ іᥒ𝖿᥆rmᥲᥴі᥆ᥒ ძᥱᥣ grᥙ⍴᥆`, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 26) {
    await this.sendMessage(m.chat, { text: `𝐆𝐑𝐔𝐏𝐎 *${m.messageStubParameters[0] == 'on' ? '𝐂𝐄𝐑𝐑𝐀𝐃𝐎 🔒' : '𝐀𝐁𝐈𝐄𝐑𝐓𝐎 🔓'}*\n ${m.messageStubParameters[0] == 'on' ? '𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍𝐒 𝐏𝐔𝐄𝐃𝐄𝐍 𝐄𝐒𝐂𝐑𝐈𝐁𝐈𝐑' : '𝐘𝐀 𝐓𝐎𝐃𝐎𝐒 𝐏𝐔𝐄𝐃𝐄𝐍 𝐄𝐒𝐂𝐑𝐈𝐁𝐈𝐑'} 𝐄𝐍 𝐄𝐒𝐓𝐄 𝐆𝐑𝐔𝐏𝐎`, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 29) {
    await this.sendMessage(m.chat, { text: `@${m.messageStubParameters[0].split`@`[0]} \`𝐀𝐇𝐎𝐑𝐀 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑\`\n\n\`🫵 𝐀𝐂𝐂𝐈𝐎𝐍 𝐇𝐄𝐂𝐇𝐀 𝐏𝐎𝐑\`\n${usuario}`, mentions: [m.sender, m.messageStubParameters[0], ...groupAdmins.map(v => v.id)] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 30) {
    await this.sendMessage(m.chat, { text: `@${m.messageStubParameters[0].split`@`[0]} \`𝐀𝐇𝐎𝐑𝐀 𝐍𝐎 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑\`\n\n\`🫵 𝐀𝐂𝐂𝐈𝐎𝐍 𝐇𝐄𝐂𝐇𝐀 𝐏𝐎𝐑\`\n${usuario}`, mentions: [m.sender, m.messageStubParameters[0], ...groupAdmins.map(v => v.id)] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 72) {
    await this.sendMessage(m.chat, { text: `${usuario} 🌟 𝐂𝐀𝐌𝐁𝐈𝐎 𝐋𝐀 𝐃𝐔𝐑𝐀𝐂𝐈𝐎́𝐍 𝐃𝐄 𝐋𝐎𝐒 𝐌𝐄𝐍𝐒𝐀𝐉𝐄𝐒 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐋𝐄𝐒 𝐀*@${m.messageStubParameters[0]}*`, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else if (chat.detect && m.messageStubType == 123) {
    await this.sendMessage(m.chat, { text: `${usuario} 🤖 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐎́ 𝐋𝐎𝐒 𝐌𝐄𝐍𝐒𝐀𝐉𝐄𝐒 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐋𝐄𝐒.`, mentions: [m.sender] }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  } else {
    console.log({
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters
    })
  }
}
