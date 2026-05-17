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

/* =========================
   BRANDING CENTRALIZADO
========================= */
const BOT_NAME = 'GUERRA BOT';
const BOT_STATUS_PREFIX = 'KIRITO BOT MD'; // solo status interno
const OWNER_NAME = 'Deylin Elíac';

/* =========================
   LOG MASK
========================= */
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
    return jid.includes('@')
        ? jid.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        : jid.split(':')[0] + '@s.whatsapp.net';
};

global.subbotConfig = {};
global.userCache = new Map();
global.dirtyUsers = new Set();

/* =========================
   USER CACHE
========================= */
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

/* =========================
   FLUSH DATA
========================= */
const flushData = async () => {
    if (global.dirtyUsers.size > 0 && global.User) {
        const usersToSave = Array.from(global.dirtyUsers);
        global.dirtyUsers.clear();

        const ops = usersToSave.map(jid => ({
            updateOne: {
                filter: { id: jid },
                update: { $set: global.userCache.get(jid) },
                upsert: true
            }
        }));

        try {
            await global.User.bulkWrite(ops, { ordered: false });
        } catch (e) {}
    }
    process.exit(0);
};

process.on('SIGINT', flushData);
process.on('SIGTERM', flushData);

/* =========================
   ERROR HANDLERS
========================= */
process.on('uncaughtException', (err) => {
    const msg = err?.message || '';
    if (
        msg.includes('rate-overlimit') ||
        msg.includes('timed out') ||
        msg.includes('Connection Closed') ||
        msg.includes('decrypt')
    ) return;
    console.error('⚠️ ERROR NO CONTROLADO:', err);
});

process.on('unhandledRejection', (reason) => {
    const msg = String(reason?.message || reason || '');
    if (
        msg.includes('rate-overlimit') ||
        msg.includes('timed out') ||
        msg.includes('Connection Closed') ||
        msg.includes('decrypt')
    ) return;
    console.error('⚠️ PROMESA NO CONTROLADA:', reason);
});

/* =========================
   LOGGER
========================= */
const silentLogger = pino({ level: 'silent' });

const originalLog = console.log;
console.log = (...args) => originalLog.apply(console, [chalk.cyan('┃'), ...args]);

const originalError = console.error;
console.error = (...args) => originalError.apply(console, [chalk.red('┗'), ...args]);

/* =========================
   DB
========================= */
const dbUrlDecoded = "mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority";

const logDB = (type, status) => {
    console.log(chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
    console.log(chalk.cyan('┃ ') + chalk.bold(`DATABASE: `) + chalk.blueBright(type));
    console.log(chalk.cyan('┃ ') + chalk.bold(`STATUS:   `) + (status === 'CONNECTED' ? chalk.greenBright(status) : chalk.redBright(status)));
    console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
};

console.clear();
cfonts.say(BOT_NAME, {
    font: 'slick',
    align: 'center',
    colors: ['cyan', 'white'],
    letterSpacing: 2
});

/* =========================
   CONNECT DB
========================= */
if (dbUrlDecoded) {
    try {
        await database.connect(dbUrlDecoded);
        logDB('CLOUD', 'CONNECTED');

        global.db = mongoose.connection.db;
        global.User = User;

        const chatSchema = new mongoose.Schema(
            { id: { type: String, unique: true }, isBanned: { type: Boolean, default: false } },
            { strict: false }
        );

        global.Chat = mongoose.model('Chat', chatSchema);

        const warnSchema = new mongoose.Schema({
            userId: { type: String, required: true },
            groupId: { type: String, required: true },
            reasons: { type: [String], default: [] },
            warnCount: { type: Number, default: 0 },
            date: { type: Date, default: Date.now }
        });

        warnSchema.index({ userId: 1, groupId: 1 }, { unique: true });
        global.Warns = mongoose.model('Warns', warnSchema);

        global.News = mongoose.model('News',
            new mongoose.Schema({
                title: { type: String, required: true },
                description: { type: String, required: true },
                command: { type: String, default: null },
                date: { type: Date, default: Date.now }
            }, { strict: false })
        );

        const subBotSettingsSchema = new mongoose.Schema({
            botId: { type: String, unique: true },
            prefix: { type: String, default: '.' },
            botName: { type: String, default: `${BOT_NAME} - SubBot` },
            botImage: { type: String, default: 'https://cdn.dix.lat/me/877124db-068b-4970-9b94-b26b4d7eb842.jpg' },
            status: { type: Boolean, default: true }
        }, { strict: false });

        global.SubBotSettings = mongoose.model('SubBotSettings', subBotSettingsSchema);

        const statsSchema = new mongoose.Schema({
            command: { type: String, unique: true },
            globalUsage: { type: Number, default: 0 },
            groups: { type: Map, of: Number, default: {} }
        }, { strict: false });

        global.Stats = mongoose.model('Stats', statsSchema);

    } catch (e) {
        logDB('CLOUD', 'ERROR');
        process.exit(1);
    }
}
