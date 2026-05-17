import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import { jidNormalizedUser } from '@whiskeysockets/baileys';
import { getRealJid } from './identifier.js';
import { cacheManager } from './cache.js';

const __filename = fileURLToPath(import.meta.url);

export async function message(m, chatUpdate) {
    this.uptime = this.uptime || Date.now();
    const conn = this;
    if (!m || !conn?.user) return;

    const mTimestamp = (m.messageTimestamp?.low || m.messageTimestamp || 0) * 1000;
    if (Date.now() - mTimestamp > 8000) return;

    const botJid = jidNormalizedUser(conn.user.id);
    const isMainBot = botJid === jidNormalizedUser(global.conn?.user?.id);

    if (!global.subbotConfig[botJid] && !isMainBot) {
        const sData = await global.SubBotSettings.findOne({ botId: botJid }).lean();
        if (sData) global.subbotConfig[botJid] = sData;
    }

    const botSettings = global.subbotConfig[botJid] || { 
        prefix: isMainBot ? ['.', '#'] : '.', 
        botName: 'Kirito', 
        botImage: global.img()
    };
    conn.settings = botSettings;

    const chatJid = m.chat;
    const msgText = (m.text || m.msg?.caption || m.msg?.text || '').trim();

    const activePrefixes = conn.settings?.prefix 
        ? (Array.isArray(conn.settings.prefix) ? conn.settings.prefix : [conn.settings.prefix])
        : ['.', '#', '/', '!'];

    const usedPrefix = activePrefixes.find(p => msgText.startsWith(p));

    if (!m.sender.endsWith('@s.whatsapp.net')) return;

    const realSenderId = await getRealJid(conn, m.sender, m);
    const senderNumber = realSenderId.split('@')[0].split(':')[0];

    const isROwner = global.owner.some(([num]) => num.replace(/\D/g, '') === senderNumber);
    const botNumber = botJid.split('@')[0].split(':')[0];
    const isSelf = senderNumber === botNumber;

    if (m.messageStubType && m.isGroup) return;

    let chat = null;
    let user = null;

    try {
        if (m?.isGroup) {
            chat = await global.Chat.findOne({ id: chatJid }).lean();
            if (!chat) {
                chat = await global.Chat.create({ 
                    id: chatJid, isBanned: false, welcome: true, muto: false, 
                    detect: true, antiLink: true, modoadmin: false, 
                    autoStickers: false, antisub: false, mutos: [], 
                    nsfw: false, antiStatus: false 
                });
            }
        }

        user = global.userCache.get(realSenderId);

        if (!user && (usedPrefix || m.isGroup)) {
            user = await global.User.findOne({ id: realSenderId }).lean();
            if (!user && usedPrefix) {
                user = await global.User.create({
                    id: realSenderId,
                    name: m.pushName || "",
                    exp: 0,
                    warnAntiLink: 0,
                    col: 10,
                    banned: false,
                    lastSeen: new Date()
                });
            }
            if (user) global.userCache.set(realSenderId, user);
        }

        if (!user && !usedPrefix) return;

    } catch (e) { return; }

    let participants = [];
    let isAdmin = false;
    let isBotAdmin = false;

    if (m.isGroup) {
        const metadata = await cacheManager.get(conn, chatJid);
        participants = metadata?.participants || [];
        isAdmin = cacheManager.getAdminStatus(chatJid, m.sender, m.author);
        isBotAdmin = cacheManager.getAdminStatus(chatJid, conn.user.id, conn.user.lid);
    }

    if (m.isGroup && chat && !isROwner) {
        if ((chat.muto || chat.mutos?.includes(realSenderId)) && isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key }).catch(() => null);
            return; 
        }
    }

    if (!msgText && !m.msg?.image && !m.msg?.video && !m.msg?.audio && !m.msg?.sticker && !m.msg?.document && !m.msg?.location && !m.msg?.viewOnceMessageV2) return;
    if (m.isGroup && chat?.antisub && !isMainBot) return;

    const allPlugins = Array.from(global.plugins.values());
    for (const plugin of allPlugins) {
        if (plugin?.before && typeof plugin.before === 'function') {
            try {
                if (await plugin.before.call(this, m, { 
                    conn, isAdmin, isBotAdmin, isOwner: isROwner, isROwner, participants, chat, user, isSelf
                })) return;
            } catch (e) { continue; }
        }
    }

    if (!usedPrefix) return;

    if (user?.banned && !isROwner) {
        if (!global.banCooldown) global.banCooldown = new Map();
        if (global.banCooldown.size > 500) global.banCooldown.clear();
        const now = Date.now();
        if (now - (global.banCooldown.get(m.sender) || 0) > 30000) {
            global.banCooldown.set(m.sender, now);
            await conn.sendMessage(m.chat, { text: `⚠️ *ACCESO RESTRINGIDO*${user.banReason ? `\n\n*Razón:* ${user.banReason}` : ''}` }, { quoted: m }).catch(() => null);
        }
        return;
    }

    if (m.isGroup && chat?.modoadmin && !isAdmin && !isROwner) return;

    const noPrefix = msgText.slice(usedPrefix.length).trim();
    const [commandName, ...args] = noPrefix.split(/\s+/);
    const command = (commandName || '').toLowerCase();
    const text = args.join(' ').trim();

    if (chat?.isBanned && command !== 'bot' && command !== 'enable' && command !== 'onchat') return;

    const pluginName = global.plugins.has(command) ? command : global.aliases.get(command);
    const plugin = global.plugins.get(pluginName);

    if (plugin) {
        if (plugin.mainOnly && !isMainBot) return conn.reply(m.chat, `> ❒ Este comando solo funciona en el bot principal.`, m);

        if (plugin.col && !isROwner) {
            if ((user.col ?? 0) < parseInt(plugin.col)) {
                global.dfail('col', m, conn, plugin.col);
                return;
            }
            user.col -= parseInt(plugin.col);
            global.updateUser(realSenderId, { col: user.col });
        }

        const checkPermissions = (perm) => ({
            rowner: isROwner, owner: isROwner, group: m.isGroup, 
            botAdmin: isBotAdmin, admin: isAdmin, private: !m.isGroup, self: isSelf
        }[perm]);

        if (plugin.nsfw && !chat?.nsfw) {
            global.dfail('nsfw', m, conn);
            return;
        }

        for (const perm of ['rowner', 'owner', 'group', 'botAdmin', 'admin', 'private', 'self']) {
            if (plugin[perm] && !checkPermissions(perm)) {
                global.dfail(perm, m, conn);
                return;
            }
        }

        try {
            if (global.Stats) {
                global.Stats.findOneAndUpdate(
                    { command: plugin.name || command },
                    { $inc: { globalUsage: 1, [`groups.${m.chat.replace(/\./g, '_')}`]: 1 } },
                    { upsert: true }
                ).catch(() => null);
            }

            await conn.readMessages([m.key]).catch(() => null);
            await plugin.run.call(conn, m, { 
                usedPrefix, noPrefix, args, command, text, conn, user, chat, 
                isROwner, isAdmin, isBotAdmin, participants, isSelf,
                settings: conn.settings || {}
            });
            if (user) global.updateUser(realSenderId, user);
        } catch (e) {
            console.error(chalk.red(`Error: ${command}`), e.message);
        }
    }
}

global.dfail = (type, m, conn, cost) => {
    const messages = {
        rowner: `> ❒ Solo mi creador puede usar este comando.`,
        owner: `> ❒ Solo mi creador puede usar este comando.`,
        group: `> ✎ Este comando sólo se puede usar en grupos.`,
        private: `De esto solo hablo en privado.`,
        admin: `> ♛ Sólo los administradores pueden ejecutar este comando.`,
        nsfw: `> ❒ El contenido NSFW está desactivado.`,
        botAdmin: `> ✰ Necesito ser administrador.`,
        col: `> ฿ Cuesta *${cost} Col*.`,
        self: `『 ✖ 』 Comando exclusivo para el host de la cuenta.`
    };
    if (messages[type] && m.chat) conn.reply(m.chat, messages[type], m).catch(() => null);
};

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'handler.js'"))
  import(`${file}?update=${Date.now()}`)
})
