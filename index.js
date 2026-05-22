```js
process.noDeprecation = true;

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

/* =========================================
   LOG FILTER
========================================= */

const maskLogs = (
    chunk,
    encoding,
    callback,
    originalWrite
) => {

    const msg =
    chunk?.toString?.() || '';

    if (
        msg.includes('Closing session') ||
        msg.includes('Removing old closed session') ||
        msg.includes('Bad MAC') ||
        msg.includes('Failed to decrypt')
    ) {

        if (typeof encoding === 'function') {
            encoding();
        } else if (typeof callback === 'function') {
            callback();
        }

        return true;
    }

    return originalWrite(
        chunk,
        encoding,
        callback
    );

};

const _stdout =
process.stdout.write.bind(process.stdout);

process.stdout.write = (
    chunk,
    encoding,
    callback
) => maskLogs(
    chunk,
    encoding,
    callback,
    _stdout
);

const _stderr =
process.stderr.write.bind(process.stderr);

process.stderr.write = (
    chunk,
    encoding,
    callback
) => maskLogs(
    chunk,
    encoding,
    callback,
    _stderr
);

/* =========================================
   GLOBALS
========================================= */

global.groupCache = cacheManager.cache;

EventEmitter.defaultMaxListeners = 0;

global.conns = new Map();

global.subbotConfig = {};

global.userCache = new Map();

global.dirtyUsers = new Set();

global.plugins = new Map();

global.aliases = new Map();

global.opts = new Object(
    yargs(process.argv.slice(2))
    .exitProcess(false)
    .parse()
);

global.prefix = new RegExp('^[#!./]');

/* =========================================
   BOT CONFIG
========================================= */

global.BOT = {
    name: 'GUERRA BOT',
    version: '7.1.0',
    owner: 'Kevin Guerra',
    prefix: '.',
    mode: 'PUBLIC',
    status: 'ONLINE'
};

/* =========================================
   HELPERS
========================================= */

const sId = (jid) => {

    if (!jid) return jid;

    return jid.includes('@')
        ? jid.split('@')[0]
            .split(':')[0] +
            '@s.whatsapp.net'
        : jid.split(':')[0] +
            '@s.whatsapp.net';

};

global.updateUser = (
    jid,
    data
) => {

    const currentData =
    global.userCache.get(jid) || {};

    const updatedData = {
        ...currentData,
        ...data,
        id: jid
    };

    global.userCache.set(
        jid,
        updatedData
    );

    global.dirtyUsers.add(jid);

    return updatedData;

};

/* =========================================
   LOGGER
========================================= */

const silentLogger = pino({
    level: 'silent'
});

const originalLog = console.log;

console.log = (...args) =>
    originalLog.apply(console, [
        chalk.cyan('┃'),
        ...args
    ]);

const originalError = console.error;

console.error = (...args) =>
    originalError.apply(console, [
        chalk.red('┗'),
        ...args
    ]);

/* =========================================
   DATABASE
========================================= */

const dbUrlDecoded =
'mongodb+srv://guerraroncancio_db_user:n5dYIEOo8T4iP2cd@cluster0.zkkz8qa.mongodb.net/bot?retryWrites=true&w=majority';

const logDB = (
    type,
    status
) => {

    console.log(
chalk.cyan(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ DATABASE: ${type}
┃ STATUS: ${status}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`)
    );

};

console.clear();

cfonts.say('GUERRA BOT', {
    font: 'block',
    align: 'center',
    gradient: ['red', 'magenta']
});

try {

    await database.connect(dbUrlDecoded);

    logDB(
        'CLOUD',
        'CONNECTED'
    );

    global.db =
    mongoose.connection.db;

    global.User = User;

} catch (e) {

    logDB(
        'CLOUD',
        'ERROR'
    );

    process.exit(1);

}

/* =========================================
   AUTO SAVE USERS
========================================= */

setInterval(async () => {

    if (
        global.dirtyUsers.size === 0 ||
        !global.User
    ) return;

    const usersToSave =
    Array.from(global.dirtyUsers);

    global.dirtyUsers.clear();

    const ops = usersToSave.map(jid => ({
        updateOne: {
            filter: { id: jid },
            update: {
                $set:
                global.userCache.get(jid)
            },
            upsert: true
        }
    }));

    try {

        await global.User.bulkWrite(
            ops,
            { ordered: false }
        );

    } catch {

        usersToSave.forEach(jid =>
            global.dirtyUsers.add(jid)
        );

    }

}, 15000);

/* =========================================
   BAILEYS
========================================= */

const {
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = await import(
    '@whiskeysockets/baileys'
);

if (!existsSync('./tmp')) {
    mkdirSync('./tmp');
}

if (!existsSync('./sessions')) {
    mkdirSync('./sessions');
}

/* =========================================
   PATH HELPERS
========================================= */

global.__filename = function filename(
    pathURL = import.meta.url,
    rmPrefix = platform !== 'win32'
) {

    return rmPrefix
        ? /file:\/\/\//.test(pathURL)
            ? fileURLToPath(pathURL)
            : pathURL
        : pathToFileURL(pathURL)
            .toString();

};

global.__dirname = function dirname(
    pathURL
) {

    return path.dirname(
        global.__filename(
            pathURL,
            true
        )
    );

};

/* =========================================
   AUTH
========================================= */

const sessionFile =
'./sessions/main.sqlite';

const {
    state,
    saveCreds
} = useSQLiteAuthState(sessionFile);

const { version } =
await fetchLatestBaileysVersion();

const msgRetryCounterCache =
new NodeCache({
    stdTTL: 3600,
    checkperiod: 600
});

/* =========================================
   WORKERS
========================================= */

global.workerMedia =
new Worker(
    new URL(
        './lib/workers/mediaWorker.js',
        import.meta.url
    )
);

global.workerText =
new Worker(
    new URL(
        './lib/workers/textWorker.js',
        import.meta.url
    )
);

/* =========================================
   CONNECTION OPTIONS
========================================= */

const connectionOptions = {

    version,

    logger: silentLogger,

    printQRInTerminal: false,

    browser: Browsers.macOS(
        'Chrome'
    ),

    auth: {
        creds: state.creds,
        keys:
        makeCacheableSignalKeyStore(
            state.keys,
            silentLogger
        )
    },

    markOnlineOnConnect: true,

    syncFullHistory: false,

    msgRetryCounterCache,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 60000,

    keepAliveIntervalMs: 15000,

    emitOwnEvents: true,

    getMessage: async () => undefined,

    patchMessageBeforeSending:
    (message) => {

        const requiresPatch =
        !!(
            message.interactiveMessage ||
            message.templateMessage ||
            message.listMessage
        );

        if (requiresPatch) {

            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        ...message
                    }
                }
            };

        }

        return message;

    }

};

/* =========================================
   CREATE CONNECTION
========================================= */

global.conn =
makeWASocket(connectionOptions);

global.conn.isMain = true;

global.conns.set(
    'main',
    global.conn
);

/* =========================================
   PAIRING CODE
========================================= */

if (!state.creds.registered) {

    const rl =
    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (t) =>
        new Promise((r) =>
            rl.question(t, r)
        );

    let phoneNumber =
    await question(
chalk.cyan(`
┃ NÚMERO WHATSAPP:
┃ `)
    );

    let addNumber =
    phoneNumber.replace(/\D/g, '');

    rl.close();

    setTimeout(async () => {

        try {

            let codeBot =
            await global.conn
            .requestPairingCode(
                addNumber
            );

            console.log(
chalk.greenBright(`
╔══════════════════════════════╗
║     CÓDIGO DE VINCULACIÓN    ║
╠══════════════════════════════╣
║ ${
codeBot?.match(/.{1,4}/g)
?.join('-') || codeBot
}
╚══════════════════════════════╝
`)
            );

        } catch (e) {

            console.error(e);

        }

    }, 3000);

}

/* =========================================
   MESSAGE HANDLER
========================================= */

let messageHandlerMain;

const loadHandlers =
async () => {

    try {

        const PathMain =
        path.join(
            process.cwd(),
            'lib/message.js'
        );

        const moduleMain =
        await import(
`file://${PathMain}?update=${Date.now()}`
        );

        messageHandlerMain =
        moduleMain.message ||
        moduleMain.default?.message ||
        moduleMain.default;

    } catch (e) {

        console.error(e);

    }

};

await loadHandlers();

watch(
    path.join(
        process.cwd(),
        'lib/message.js'
    ),
    loadHandlers
);

/* =========================================
   RELOAD SYSTEM
========================================= */

global.reload =
async function(restatConn) {

    if (restatConn) {

        try {
            global.conn.ws.close();
        } catch {}

        const {
            state: newState,
            saveCreds: newSaveCreds
        } = useSQLiteAuthState(
            sessionFile
        );

        global.conn =
        makeWASocket({

            ...connectionOptions,

            auth: {
                creds: newState.creds,
                keys:
                makeCacheableSignalKeyStore(
                    newState.keys,
                    silentLogger
                )
            }

        });

        global.conn.ev.on(
            'creds.update',
            newSaveCreds
        );

        global.conns.set(
            'main',
            global.conn
        );

    }

    global.conn.ev.removeAllListeners(
        'messages.upsert'
    );

    observeEvents(global.conn);

    global.conn.ev.on(
        'messages.upsert',
        async(chatUpdate) => {

            const msg =
            chatUpdate.messages[0];

            if (!msg) return;

            try {

                const m =
                await smsg(
                    global.conn,
                    msg
                );

                if (m.isMedia) {

                    const mClone =
                    JSON.parse(
                        JSON.stringify(m)
                    );

                    const messagesClone =
                    JSON.parse(
                        JSON.stringify(
                            chatUpdate.messages
                        )
                    );

                    global.workerMedia
                    .postMessage({
                        sock: 'main',
                        m: mClone,
                        messages: messagesClone
                    });

                    return;

                }

                if (
                    messageHandlerMain &&
                    (
                        msg.message ||
                        msg.messageStubType
                    )
                ) {

                    await messageHandlerMain.call(
                        global.conn,
                        m,
                        chatUpdate
                    );

                }

            } catch (e) {

                if (
                    !e.message
                    ?.includes('decrypt')
                ) {
                    console.error(e);
                }

            }

        }
    );

    global.conn.ev.removeAllListeners(
        'connection.update'
    );

    global.conn.ev.on(
        'connection.update',
        async(update) => {

            const {
                connection,
                lastDisconnect
            } = update;

            if (connection === 'close') {

                const reason =
                new Boom(
                    lastDisconnect?.error
                )?.output?.statusCode || 0;

                if (
                    reason === DisconnectReason.loggedOut ||
                    reason === 403
                ) {

                    console.error(
chalk.red(`
┃ STATUS: SESIÓN INVALIDADA
`)
                    );

                    if (
                        fs.existsSync(
                            sessionFile
                        )
                    ) {
                        fs.unlinkSync(
                            sessionFile
                        );
                    }

                    process.exit(1);

                } else {

                    console.log(
chalk.yellowBright(`
╔══════════════════════════════╗
║       RECONNECTING...       ║
╚══════════════════════════════╝
`)
                    );

                    setTimeout(async () => {

                        try {

                            await global.reload(true);

                        } catch (err) {

                            console.error(err);

                        }

                    }, 5000);

                }

            }

            if (connection === 'open') {

                global.botNumber =
                sId(global.conn.user.id);

                console.clear();

                cfonts.say('GUERRA BOT', {
                    font: 'block',
                    align: 'center',
                    gradient: ['red', 'magenta']
                });

                console.log(
chalk.greenBright(`
╔══════════════════════════════╗
║        GUERRA BOT MD        ║
╠══════════════════════════════╣
║ OWNER  : Kevin Guerra       ║
║ MODE   : PUBLIC             ║
║ STATUS : ONLINE             ║
╚══════════════════════════════╝
`)
                );

                console.log(
chalk.cyanBright(`
╔══════════════════════════════╗
║      SYSTEM INITIALIZED      ║
╚══════════════════════════════╝
`)
                );

                const groups =
                await global.conn
                .groupFetchAllParticipating()
                .catch(() => ({}));

                for (const id in groups) {

                    cacheManager
                    .updateParticipants(
                        id,
                        groups[id]
                        .participants
                    );

                    global.groupCache.set(
                        id,
                        groups[id]
                    );

                }

            }

        }
    );

    global.conn.ev.on(
        'creds.update',
        saveCreds
    );

};

await global.reload();

/* =========================================
   PLUGIN SYSTEM
========================================= */

async function readRecursive(folder) {

    const files =
    await fsP.readdir(folder);

    for (let filename of files) {

        const file =
        join(folder, filename);

        const st =
        await fsP.stat(file);

        if (st.isDirectory()) {

            await readRecursive(file);

        } else if (/\\.js$/.test(filename)) {

            try {

                const module =
                await import(
`file://${file}?update=${Date.now()}`
                );

                const plugin =
                module.default || module;

                const name =
                plugin.name ||
                basename(filename, '.js');

                global.plugins.set(
                    name,
                    plugin
                );

                if (plugin.alias) {

                    (
                        Array.isArray(
                            plugin.alias
                        )
                        ? plugin.alias
                        : [plugin.alias]
                    ).forEach(a =>
                        global.aliases.set(
                            a,
                            name
                        )
                    );

                }

            } catch (e) {

                console.error(e);

            }

        }

    }

}

await readRecursive(
    join(
        process.cwd(),
        './plugins'
    )
);

/* =========================================
   SUB HANDLER
========================================= */

global.subHandler =
async (...args) => {

    if (messageHandlerMain) {

        return await
        messageHandlerMain.call(
            ...args
        );

    }

};
```
