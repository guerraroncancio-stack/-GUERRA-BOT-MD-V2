import { Worker } from 'worker_threads';
import './config.js';
import mongoose from 'mongoose';
import { database, User } from './lib/db.js';
import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import path, { join, basename } from 'path';
import fs, { existsSync, mkdirSync, watch, promises as fsP } from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import yargs from 'yargs';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import cfonts from 'cfonts';
import { smsg } from './lib/serializer.js';
import { EventEmitter } from 'events';
import { cacheManager } from './lib/cache.js';
import useSQLiteAuthState from './lib/auth.js';
import { observeEvents } from './lib/event/detect.js';

process.removeAllListeners('warning');

const maskLogs = (chunk, encoding, callback, originalWrite) => {
    const msg = chunk?.toString?.() || '';
    if (
        msg.includes('Closing session') || 
        msg.includes('Removing old closed session') || 
        msg.includes('Bad MAC') || 
        msg.includes('Failed to decrypt')
    ) {
        if (typeof encoding === 'function') encoding();
        else if (typeof callback === 'function') callback();
        return true;
    }
    return originalWrite(chunk, encoding, callback);
};

const _stdout = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, callback) => maskLogs(chunk, encoding, callback, _stdout);

const _stderr = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, encoding, callback) => maskLogs(chunk, encoding, callback, _stderr);

global.groupCache = cacheManager.cache; 
EventEmitter.defaultMaxListeners = 0;
global.conns = new Map();

const sId = (jid) => {
    if (!jid) return jid;
    return jid.includes('@') ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net' : jid.split(':')[0] + '@s.whatsapp.net';
};

global.subbotConfig = {};
global.userCache = new Map();
global.dirtyUsers = new Set();

global.updateUser = (jid, data) => {
    const currentData = global.userCache.get(jid) || {};
    const updatedData = { ...currentData, ...data, id: jid };
    global.userCache.set(jid, updatedData);
    global.dirtyUsers.add(jid);
    return updatedData;
};

global.updateSubBotSettings = (botId, data) => {
    const current = global.subbotConfig[botId] || {};
    global.subbotConfig[botId] = { ...current, ...data, botId };
    return global.subbotConfig[botId];
};

const flushData = async () => {
    if (global.dirtyUsers.size > 0 && global.User) {
        const usersToSave = Array.from(global.dirtyUsers);
        global.dirtyUsers.clear();
        const ops = usersToSave.map(jid => ({
            updateOne: { filter: { id: jid }, update: { $set: global.userCache.get(jid) }, upsert: true }
        }));
        try { await global.User.bulkWrite(ops, { ordered: false }); } catch (e) {}
    }
    process.exit(0);
};

process.on('SIGINT', flushData);
process.on('SIGTERM', flushData);

process.on('uncaughtException', (err) => {
    const msg = err?.message || '';
    if (msg.includes('rate-overlimit') || msg.includes('timed out') || msg.includes('Connection Closed') || msg.includes('decrypt')) return;
    console.error('⚠️ ERROR NO CONTROLADO:', err);
});

process.on('unhandledRejection', (reason) => {
    const msg = String(reason?.message || reason || '');
    if (msg.includes('rate-overlimit') || msg.includes('timed out') || msg.includes('Connection Closed') || msg.includes('decrypt')) return;
    console.error('⚠️ PROMESA NO CONTROLADA:', reason);
});

const silentLogger = pino({ level: 'silent' });
const originalLog = console.log;
console.log = (...args) => originalLog.apply(console, [chalk.cyan('┃'), ...args]);
const originalError = console.error;
console.error = (...args) => originalError.apply(console, [chalk.red('┗'), ...args]);

const dbUrlDecoded = "mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority"; 

const logDB = (type, status) => {
    console.log(chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
    console.log(chalk.cyan('┃ ') + chalk.bold(`DATABASE: `) + chalk.blueBright(type));
    console.log(chalk.cyan('┃ ') + chalk.bold(`STATUS:   `) + (status === 'CONNECTED' ? chalk.greenBright(status) : chalk.redBright(status)));
    console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
};

console.clear();
cfonts.say('GUERRA BOT', { font: 'slick', align: 'center', colors: ['cyan', 'white'], letterSpacing: 2 });

if (dbUrlDecoded) {
    try {
        await database.connect(dbUrlDecoded);
        logDB('CLOUD', 'CONNECTED');
        global.db = mongoose.connection.db;
        global.User = User;
        const chatSchema = new mongoose.Schema({ id: { type: String, unique: true }, isBanned: { type: Boolean, default: false } }, { strict: false });
        global.Chat = mongoose.model('Chat', chatSchema);
        const warnSchema = new mongoose.Schema({ userId: { type: String, required: true }, groupId: { type: String, required: true }, reasons: { type: [String], default: [] }, warnCount: { type: Number, default: 0 }, date: { type: Date, default: Date.now } });
        warnSchema.index({ userId: 1, groupId: 1 }, { unique: true });
        global.Warns = mongoose.model('Warns', warnSchema);
        global.News = mongoose.model('News', new mongoose.Schema({ title: { type: String, required: true }, description: { type: String, required: true }, command: { type: String, default: null }, date: { type: Date, default: Date.now } }, { strict: false }));
        const subBotSettingsSchema = new mongoose.Schema({
            botId: { type: String, unique: true },
            prefix: { type: String, default: '.' },
            botName: { type: String, default: 'GUERRA - SubBot' },
            botImage: { type: String, default: 'https://cdn.dix.lat/me/877124db-068b-4970-9b94-b26b4d7eb842.jpg' },
            status: { type: Boolean, default: true }
        }, { strict: false });
        global.SubBotSettings = mongoose.model('SubBotSettings', subBotSettingsSchema);
        const statsSchema = new mongoose.Schema({ command: { type: String, unique: true }, globalUsage: { type: Number, default: 0 }, groups: { type: Map, of: Number, default: {} } }, { strict: false });
        global.Stats = mongoose.model('Stats', statsSchema);
    } catch (e) {
        logDB('CLOUD', 'ERROR');
        process.exit(1);
    }
}

setInterval(async () => {
    if (global.dirtyUsers.size === 0 || !global.User) return;
    const usersToSave = Array.from(global.dirtyUsers);
    global.dirtyUsers.clear();
    const ops = usersToSave.map(jid => ({
        updateOne: { filter: { id: jid }, update: { $set: global.userCache.get(jid) }, upsert: true }
    }));
    try {
        await global.User.bulkWrite(ops, { ordered: false });
    } catch (e) {
        usersToSave.forEach(jid => global.dirtyUsers.add(jid));
    }
}, 15000);

const { 
    makeWASocket, DisconnectReason, fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, Browsers
} = await import('@whiskeysockets/baileys');

if (!existsSync('./tmp')) mkdirSync('./tmp');
if (!existsSync('./sessions')) mkdirSync('./sessions');

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!./]');

const sessionFile = './sessions/main.sqlite';
const { state, saveCreds } = useSQLiteAuthState(sessionFile);
const { version } = await fetchLatestBaileysVersion();
const msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

global.workerMedia = new Worker(new URL('./lib/workers/mediaWorker.js', import.meta.url));
global.workerText = new Worker(new URL('./lib/workers/textWorker.js', import.meta.url));

const connectionOptions = {
  version,
  logger: silentLogger, 
  printQRInTerminal: false,
  browser: Browsers.macOS("Chrome"),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, silentLogger), 
  },
  markOnlineOnConnect: true,
  syncFullHistory: false,
  msgRetryCounterCache,
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000, 
  keepAliveIntervalMs: 15000,
  emitOwnEvents: true,
  getMessage: async (key) => { return undefined; },
  patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.interactiveMessage || message.templateMessage || message.listMessage);
      if (requiresPatch) {
          message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, ...message } } };
      }
      return message;
  }
};

global.conn = makeWASocket(connectionOptions);
global.conn.isMain = true;
global.conns.set('main', global.conn);

if (!state.creds.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (t) => new Promise((r) => rl.question(t, r));
    let phoneNumber = await question(chalk.cyan('┃ ') + `Número: `);
    let addNumber = phoneNumber.replace(/\D/g, '');
    rl.close();
    setTimeout(async () => {
        try {
            let codeBot = await conn.requestPairingCode(addNumber);
            console.log(chalk.cyan('┃ ') + chalk.bgBlack.white.bold(` CÓDIGO: ${codeBot?.match(/.{1,4}/g)?.join("-") || codeBot} `));
        } catch (e) { console.error(e); }
    }, 3000);
}

let messageHandlerMain;
const loadHandlers = async () => {
    try {
        const PathMain = path.join(process.cwd(), 'lib/message.js');
        
        const moduleMain = await import(`file://${PathMain}?update=${Date.now()}`);
        messageHandlerMain = moduleMain.message || moduleMain.default?.message || moduleMain.default;
    } catch (e) { console.error(e); }
};

await loadHandlers();
watch(path.join(process.cwd(), 'lib/message.js'), loadHandlers);

global.reload = async function(restatConn) {
  if (restatConn) {
    try { global.conn.ws.close(); } catch {}
    const { state: newState, saveCreds: newSaveCreds } = useSQLiteAuthState(sessionFile);
    global.conn = makeWASocket({
        ...connectionOptions,
        auth: {
            creds: newState.creds,
            keys: makeCacheableSignalKeyStore(newState.keys, silentLogger),
        }
    });
    global.conn.ev.on('creds.update', newSaveCreds);
    global.conns.set('main', global.conn);
  }

  global.conn.ev.removeAllListeners('messages.upsert');
  observeEvents(global.conn);
  global.conn.ev.on('messages.upsert', async (chatUpdate) => {
    const msg = chatUpdate.messages[0];
    if (!msg) return;
    try {
        const m = await smsg(global.conn, msg);
              if (m.isMedia) {

    const mClone = JSON.parse(JSON.stringify(m));
    const messagesClone = JSON.parse(JSON.stringify(chatUpdate.messages));

    global.workerMedia.postMessage({ 
        sock: 'main', 
        m: mClone, 
        messages: messagesClone 
    });
    return;
}


        if (messageHandlerMain && (msg.message || msg.messageStubType)) {
            await messageHandlerMain.call(global.conn, m, chatUpdate);
        }
    } catch (e) { if (!e.message?.includes('decrypt')) console.error(e); }
  });

  global.conn.ev.removeAllListeners('connection.update');
  global.conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode || 0;
        if (reason === DisconnectReason.loggedOut || reason === 403) { 
            console.error(chalk.red(`┃ STATUS: SESIÓN INVALIDADA`));
            if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);
            process.exit(1);
        } else {
            setTimeout(() => global.reload(true), 10000); 
        }
    }

    if (connection === 'open') {
        global.botNumber = sId(global.conn.user.id);
        console.log(chalk.cyan('┃ ') + chalk.greenBright.bold(`STATUS: ONLINE`));
        console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));

        const groups = await global.conn.groupFetchAllParticipating().catch(() => ({}));
        for (const id in groups) {
            cacheManager.updateParticipants(id, groups[id].participants);
            global.groupCache.set(id, groups[id]);
        }
        if (global.SubBotSettings) {
            const allSettings = await global.SubBotSettings.find({ status: true });
            allSettings.forEach(s => {
                global.subbotConfig[s.botId] = s;
            });
        }

        setTimeout(async () => {
            try {
                const { loadSubBots } = await import('./lib/serbot.js');
                await loadSubBots(global.conn);
            } catch (e) {}
        }, 1000);

        const updateStatus = async () => {
            try {
                const time = new Date().toLocaleString('es-HN', { hour12: true });
                await global.conn.query({
                    tag: 'iq',
                    attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
                    content: [{ tag: 'status', attrs: {}, content: Buffer.from(`KIRITO BOT MD | ${time}`, 'utf-8') }]
                });
            } catch {}
        };
        updateStatus();
        if (global.keepAlive) clearInterval(global.keepAlive);
        global.keepAlive = setInterval(updateStatus, 600000);
    }
  });

  global.conn.ev.on('creds.update', saveCreds);

  global.conn.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
        const metadata = await global.conn.groupMetadata(update.id).catch(() => null);
        if (metadata) {
            global.groupCache.set(update.id, metadata);
            cacheManager.updateParticipants(update.id, metadata.participants);
        }
    }
  });
};

await global.reload();

global.plugins = new Map();
global.aliases = new Map();

async function readRecursive(folder) {
  const files = await fsP.readdir(folder);
  for (let filename of files) {
    const file = join(folder, filename);
    const st = await fsP.stat(file);
    if (st.isDirectory()) await readRecursive(file);
    else if (/\.js$/.test(filename)) {
      try {
        const module = await import(`file://${file}?update=${Date.now()}`);
        const plugin = module.default || module;
        const name = plugin.name || basename(filename, '.js');
        global.plugins.set(name, plugin);
        if (plugin.alias) (Array.isArray(plugin.alias) ? plugin.alias : [plugin.alias]).forEach(a => global.aliases.set(a, name));
      } catch (e) { console.error(e); }
    }
  }
}

global.reloadHandler = async function (check) {
    global.plugins.clear();
    global.aliases.clear();
    await readRecursive(join(process.cwd(), './plugins'));
    if (check) return true;
};

await readRecursive(join(process.cwd(), './plugins'));

global.subHandler = async (...args) => {
    if (messageHandlerMain) return await messageHandlerMain.call(...args);
};

