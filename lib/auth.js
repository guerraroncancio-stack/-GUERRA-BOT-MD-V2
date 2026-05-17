import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';

const useSQLiteAuthState = (file) => {
    const folder = path.dirname(file);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    let db;
    try {
        db = new Database(file);
    } catch (e) {
        console.error('┃ ERROR SQLITE AUTH DB:', e);
        throw e;
    }

    db.pragma('journal_mode = WAL');

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `).run();

    const writeData = (key, value) => {
        try {
            const data = JSON.stringify(value, BufferJSON.replacer);
            db.prepare(`
                INSERT OR REPLACE INTO auth (key, value)
                VALUES (?, ?)
            `).run(key, data);
        } catch (e) {
            console.error('┃ WRITE AUTH ERROR:', e);
        }
    };

    const readData = (key) => {
        try {
            const row = db.prepare(`
                SELECT value FROM auth WHERE key = ?
            `).get(key);

            if (!row?.value) return null;

            return JSON.parse(row.value, BufferJSON.reviver);
        } catch (e) {
            console.error('┃ READ AUTH ERROR:', e);
            return null;
        }
    };

    const removeData = (key) => {
        try {
            db.prepare(`
                DELETE FROM auth WHERE key = ?
            `).run(key);
        } catch (e) {
            console.error('┃ DELETE AUTH ERROR:', e);
        }
    };

    let creds = readData('creds');

    // 🔥 FIX CRÍTICO: recovery automático
    if (!creds || typeof creds !== 'object') {
        console.log('┃ CREDS NO VÁLIDOS → GENERANDO NUEVOS');
        creds = initAuthCreds();
        writeData('creds', creds);
    }

    return {
        state: {
            creds,

            keys: {
                get: async (type, ids) => {
                    const data = {};

                    for (const id of ids) {
                        let value = readData(`${type}-${id}`);

                        if (type === 'app-state-sync-key' && value) {
                            try {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            } catch {
                                value = null;
                            }
                        }

                        data[id] = value;
                    }

                    return data;
                },

                set: async (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;

                            if (value) writeData(key, value);
                            else removeData(key);
                        }
                    }
                }
            }
        },

        saveCreds: async () => {
            try {
                writeData('creds', creds);
            } catch (e) {
                console.error('┃ SAVE CREDS ERROR:', e);
            }
        }
    };
};

export default useSQLiteAuthState;
