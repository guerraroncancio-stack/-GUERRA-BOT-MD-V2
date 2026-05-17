import fs from 'fs';
import path from 'path';
import { proto, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';

/* =========================
   FILE STORAGE AUTH (SIN SQLITE)
========================= */

export default function useAuthState(filePath) {

    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const readFile = () => {
        try {
            if (!fs.existsSync(filePath)) return null;
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'), BufferJSON.reviver);
        } catch {
            return null;
        }
    };

    const writeFile = (data) => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, BufferJSON.replacer, 2));
        } catch {}
    };

    const creds = readFile()?.creds || initAuthCreds();

    const state = {
        creds,
        keys: {
            get: async (type, ids) => {
                const data = readFile() || {};
                const result = {};

                for (const id of ids) {
                    let value = data?.[type]?.[id];

                    if (type === 'app-state-sync-key' && value) {
                        value = proto.Message.AppStateSyncKeyData.fromObject(value);
                    }

                    result[id] = value || null;
                }

                return result;
            },

            set: async (data) => {
                const current = readFile() || { creds, keys: {} };

                for (const category in data) {
                    for (const id in data[category]) {
                        if (!current.keys) current.keys = {};
                        if (!current.keys[category]) current.keys[category] = {};

                        const value = data[category][id];
                        if (value) {
                            current.keys[category][id] = value;
                        } else {
                            delete current.keys[category]?.[id];
                        }
                    }
                }

                writeFile({ ...current, creds });
            }
        }
    };

    const saveCreds = () => {
        const current = readFile() || {};
        writeFile({
            ...current,
            creds
        });
    };

    return { state, saveCreds };
}
