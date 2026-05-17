import Database from 'better-sqlite3';
import { proto } from '@whiskeysockets/baileys';
import { BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';

export default function useSQLiteAuthState(dbPath) {

    const db = new Database(dbPath, {
        verbose: null
    });

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            id TEXT PRIMARY KEY,
            value TEXT
        )
    `).run();

    /* =========================
       MEMORY CACHE (MEJORA CLAVE)
    ========================= */
    const cache = new Map();

    const writeData = (id, data) => {
        try {
            const json = JSON.stringify(data, BufferJSON.replacer);
            cache.set(id, data);

            db.prepare(
                'INSERT OR REPLACE INTO auth (id, value) VALUES (?, ?)'
            ).run(id, json);
        } catch (e) {}
    };

    const readData = (id) => {
        try {
            if (cache.has(id)) return cache.get(id);

            const row = db.prepare(
                'SELECT value FROM auth WHERE id = ?'
            ).get(id);

            if (!row) return null;

            const parsed = JSON.parse(row.value, BufferJSON.reviver);
            cache.set(id, parsed);

            return parsed;
        } catch (e) {
            return null;
        }
    };

    const removeData = (id) => {
        try {
            cache.delete(id);
            db.prepare('DELETE FROM auth WHERE id = ?').run(id);
        } catch (e) {}
    };

    let creds = readData('creds');

    if (!creds) {
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
                        try {
                            let value = readData(`${type}-${id}`);

                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }

                            data[id] = value;
                        } catch {
                            data[id] = null;
                        }
                    }

                    return data;
                },

                set: async (data) => {
                    try {
                        for (const category in data) {
                            for (const id in data[category]) {
                                const value = data[category][id];
                                const key = `${category}-${id}`;

                                if (value) writeData(key, value);
                                else removeData(key);
                            }
                        }
                    } catch {}
                }
            }
        },

        saveCreds: () => {
            try {
                writeData('creds', creds);
            } catch {}
        }
    };
}
