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

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            id TEXT PRIMARY KEY,
            value TEXT
        )
    `).run()

    const readData = (id) => {

        const row = db
            .prepare(
                'SELECT value FROM auth WHERE id = ?'
            )
            .get(id)

        if (!row) return null

        return JSON.parse(
            row.value,
            BufferJSON.reviver
        )

    }

    const writeData = (id, value) => {

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

    }

    const removeData = (id) => {

        db.prepare(
            'DELETE FROM auth WHERE id = ?'
        ).run(id)

    }

    let creds =
        readData('creds') ||
        initAuthCreds()

    return {

        state: {

            creds,

            keys: {

                get: async (type, ids) => {

                    const data = {}

                    for (const id of ids) {

                        let value =
                            readData(`${type}-${id}`)

                        if (
                            type ===
                            'app-state-sync-key'
                        ) {

                            value =
                            proto.Message
                            .AppStateSyncKeyData
                            .fromObject(value)

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

                            if (value) {

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

        }

    }

}
