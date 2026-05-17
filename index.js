import { Worker } from 'worker_threads';
import './config.js';
import mongoose from 'mongoose';
import { database, User } from './lib/db.js';

import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import path, { join, basename } from 'path';

import fs, {
  existsSync,
  mkdirSync,
  watch,
  promises as fsP
} from 'fs';

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

/* ===================== LOG MASK ===================== */
const maskLogs = (chunk, enc, cb, original) => {
  const msg = chunk?.toString?.() || '';
  if (
    msg.includes('Closing session') ||
    msg.includes('Removing old closed session') ||
    msg.includes('Bad MAC') ||
    msg.includes('Failed to decrypt')
  ) return;

  return original(chunk, enc, cb);
};

process.stdout.write = ((w) => (c, e, cb) => maskLogs(c, e, cb, w))(process.stdout.write.bind(process.stdout));
process.stderr.write = ((w) => (c, e, cb) => maskLogs(c, e, cb, w))(process.stderr.write.bind(process.stderr));

/* ===================== GLOBALS ===================== */
global.groupCache = cacheManager.cache;
global.conns = new Map();

EventEmitter.defaultMaxListeners = 0;

const normalizeJid = (jid) => {
  if (!jid) return jid;
  return jid.includes('@')
    ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
    : jid.split(':')[0] + '@s.whatsapp.net';
};

global.subbotConfig = {};
global.userCache = new Map();
global.dirtyUsers = new Set();

global.updateUser = (jid, data) => {
  const prev = global.userCache.get(jid) || {};
  const updated = { ...prev, ...data, id: jid };
  global.userCache.set(jid, updated);
  global.dirtyUsers.add(jid);
  return updated;
};

global.updateSubBotSettings = (botId, data) => {
  const prev = global.subbotConfig[botId] || {};
  return (global.subbotConfig[botId] = { ...prev, ...data, botId });
};

/* ===================== FLUSH ===================== */
const flushData = async () => {
  try {
    if (global.dirtyUsers.size && global.User) {
      const ops = [...global.dirtyUsers].map((jid) => ({
        updateOne: {
          filter: { id: jid },
          update: { $set: global.userCache.get(jid) },
          upsert: true
        }
      }));

      global.dirtyUsers.clear();
      await global.User.bulkWrite(ops, { ordered: false });
    }
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', flushData);
process.on('SIGTERM', flushData);

/* ===================== ERROR HANDLERS ===================== */
process.on('uncaughtException', (err) => {
  const msg = err?.message || '';
  if (/(rate-overlimit|timed out|Connection Closed|decrypt)/i.test(msg)) return;
  console.error('UNCAUGHT:', err);
});

process.on('unhandledRejection', (r) => {
  const msg = String(r?.message || r || '');
  if (/(rate-overlimit|timed out|Connection Closed|decrypt)/i.test(msg)) return;
  console.error('PROMISE:', r);
});

/* ===================== LOG STYLE ===================== */
const silentLogger = pino({ level: 'silent' });

console.log = (...a) => console.info(chalk.cyan('┃'), ...a);
console.error = (...a) => console.info(chalk.red('┗'), ...a);

/* ===================== DB ===================== */
const dbUrlDecoded =
  'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority';

const logDB = (t, s) => {
  console.log(chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
  console.log(chalk.cyan('┃ DATABASE:'), chalk.blueBright(t));
  console.log(chalk.cyan('┃ STATUS:'), s === 'CONNECTED' ? chalk.green(s) : chalk.red(s));
  console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
};

console.clear();
cfonts.say('GUERRA BOT', {
  font: 'slick',
  align: 'center',
  colors: ['cyan', 'white']
});

/* ===================== CONNECT DB ===================== */
if (dbUrlDecoded) {
  try {
    await database.connect(dbUrlDecoded);
    logDB('CLOUD', 'CONNECTED');

    global.db = mongoose.connection.db;
    global.User = User;

    const chatSchema = new mongoose.Schema(
      { id: String, isBanned: Boolean },
      { strict: false }
    );

    global.Chat = mongoose.model('Chat', chatSchema);

    global.Warns = mongoose.model(
      'Warns',
      new mongoose.Schema(
        {
          userId: String,
          groupId: String,
          reasons: [String],
          warnCount: Number,
          date: Date
        },
        { strict: false }
      )
    );

    global.News = mongoose.model(
      'News',
      new mongoose.Schema(
        {
          title: String,
          description: String,
          command: String,
          date: Date
        },
        { strict: false }
      )
    );

    global.SubBotSettings = mongoose.model(
      'SubBotSettings',
      new mongoose.Schema({
        botId: { type: String, unique: true },
        prefix: String,
        botName: String,
        botImage: String,
        status: Boolean
      })
    );

    global.Stats = mongoose.model(
      'Stats',
      new mongoose.Schema({
        command: { type: String, unique: true },
        globalUsage: Number,
        groups: Map
      })
    );
  } catch {
    logDB('CLOUD', 'ERROR');
    process.exit(1);
  }
}

/* ===================== BAILEYS ===================== */
const {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = await import('@whiskeysockets/baileys');

if (!existsSync('./tmp')) mkdirSync('./tmp');
if (!existsSync('./sessions')) mkdirSync('./sessions');

global.__filename = (p = import.meta.url, rm = platform !== 'win32') =>
  rm ? fileURLToPath(p) : pathToFileURL(p).toString();

global.__dirname = (p) => path.dirname(global.__filename(p, true));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = /^[#!./]/;

/* ===================== AUTH ===================== */
const sessionFile = './sessions/main.sqlite';
const { state, saveCreds } = useSQLiteAuthState(sessionFile);
const { version } = await fetchLatestBaileysVersion();

const msgRetryCounterCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600
});

/* ===================== WORKERS ===================== */
global.workerMedia = new Worker(new URL('./lib/workers/mediaWorker.js', import.meta.url));
global.workerText = new Worker(new URL('./lib/workers/textWorker.js', import.meta.url));

/* ===================== SOCKET ===================== */
const connectionOptions = {
  version,
  logger: silentLogger,
  printQRInTerminal: false,
  browser: Browsers.macOS('Chrome'),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, silentLogger)
  },
  markOnlineOnConnect: true,
  msgRetryCounterCache,
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 15000,
  emitOwnEvents: true,
  getMessage: async () => undefined,
  patchMessageBeforeSending: (m) => m
};

global.conn = makeWASocket(connectionOptions);
global.conns.set('main', global.conn);

/* ===================== EXPORT CONNECTION ===================== */
await import('./lib/message.js');

/* ===================== CLEAN ===================== */
console.log(chalk.cyan('┃ BOT INICIADO CORRECTAMENTE'));
