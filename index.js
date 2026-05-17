import { Worker } from 'worker_threads';
import './config.js';
import mongoose from 'mongoose';
import { database, User } from './lib/db.js';

import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';

import path from 'path';
import { join, basename } from 'path';

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

const _stdout = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => maskLogs(c, e, cb, _stdout);

const _stderr = process.stderr.write.bind(process.stderr);
process.stderr.write = (c, e, cb) => maskLogs(c, e, cb, _stderr);

/* ===================== GLOBALS ===================== */
global.groupCache = cacheManager.cache;
global.conns = new Map();
EventEmitter.defaultMaxListeners = 0;

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

/* ===================== ERRORS ===================== */
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

console.clear();
cfonts.say('GUERRA BOT', {
  font: 'slick',
  align: 'center',
  colors: ['cyan', 'white']
});

if (dbUrlDecoded) {
  try {
    await database.connect(dbUrlDecoded);

    global.db = mongoose.connection.db;
    global.User = User;

    const chatSchema = new mongoose.Schema({ id: String, isBanned: Boolean }, { strict: false });
    global.Chat = mongoose.model('Chat', chatSchema);

    global.Warns = mongoose.model('Warns', new mongoose.Schema({
      userId: String,
      groupId: String,
      reasons: [String],
      warnCount: Number,
      date: Date
    }, { strict: false }));

    global.News = mongoose.model('News', new mongoose.Schema({
      title: String,
      description: String,
      command: String,
      date: Date
    }, { strict: false }));

    global.SubBotSettings = mongoose.model('SubBotSettings', new mongoose.Schema({
      botId: { type: String, unique: true },
      prefix: String,
      botName: String,
      botImage: String,
      status: Boolean
    }));

    global.Stats = mongoose.model('Stats', new mongoose.Schema({
      command: { type: String, unique: true },
      globalUsage: Number,
      groups: Map
    }));

  } catch {
    console.error('DB ERROR');
    process.exit(1);
  }
}

/* ===================== BAILEYS ===================== */
const {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = await import('@whiskeysockets/baileys');

if (!existsSync('./tmp')) mkdirSync('./tmp');
if (!existsSync('./sessions')) mkdirSync('./sessions');

/* FIX ESM DIRNAME */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = /^[#!./]/;

/* ===================== AUTH ===================== */
const sessionFile = './sessions/main.sqlite';
const auth = useSQLiteAuthState(sessionFile);

if (!auth?.state?.creds) {
  console.error('AUTH STATE NO CARGÓ');
  process.exit(1);
}

const { state, saveCreds } = auth;
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
    creds: state.creds || {},
    keys: makeCacheableSignalKeyStore(state.keys || {}, silentLogger)
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

/* ===================== HANDLER ===================== */
await import('./lib/message.js');

/* ===================== READY ===================== */
console.log(chalk.cyan('┃ BOT INICIADO CORRECTAMENTE'));
