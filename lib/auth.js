import Database from 'better-sqlite3'
import {
    proto,
    initAuthCreds,
    BufferJSON
} from '@whiskeysockets/baileys'

export default function useSQLiteAuthState(dbPath) {

    const db = new Database(dbPath)

    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('foreign_keys = ON')

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            id TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `).run()

    const readData = (id) => {
        try {
            const row = db
                .prepare('SELECT value FROM auth WHERE id = ?')
                .get(id)

            if (!row?.value) return null

            return JSON.parse(
                row.value,
                BufferJSON.reviver
            )

        } catch {
            return null
        }
    }

    const writeData = (id, value) => {
        try {
            db.prepare(`
                INSERT OR REPLACE INTO auth
                (id, value)
                VALUES (?, ?)
            `).run(
                id,
                JSON.stringify(
                    value,
                    BufferJSON.replacer
                )
            )
        } catch (e) {
            console.error(
                '[AUTH WRITE ERROR]',
                e?.message
            )
        }
    }

    const removeData = (id) => {
        try {
            db.prepare(
                'DELETE FROM auth WHERE id = ?'
            ).run(id)
        } catch {}
    }

    let creds = readData('creds')

    if (!creds) {
        creds = initAuthCreds()
        writeData('creds', creds)
    }

    const setCreds = (newCreds) => {
        creds = newCreds
        writeData('creds', creds)
    }

    return {

        state: {

            creds,

            keys: {

                get: async (type, ids) => {

                    const data = {}

                    for (const id of ids) {

                        let value =
                            readData(
                                `${type}-${id}`
                            )

                        if (
                            value &&
                            type ===
                                'app-state-sync-key'
                        ) {
                            try {

                                value =
                                    proto.Message
                                    .AppStateSyncKeyData
                                    .fromObject(value)

                            } catch {
                                value = null
                            }
                        }

                        data[id] = value
                    }

                    return data
                },

                set: async (data) => {

                    for (const category in data) {

                        for (const id in data[category]) {

                            const value =
                                data[category][id]

                            const key =
                                `${category}-${id}`

                            if (
                                value !== null &&
                                value !== undefined
                            ) {

                                writeData(
                                    key,
                                    value
                                )

                            } else {

                                removeData(key)

                            }
                        }
                    }
                }
            }
        },

        saveCreds: async () => {
            writeData(
                'creds',
                creds
            )
        },

        setCreds,

        db
    }
}
