import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import {
    BufferJSON,
    initAuthCreds,
    proto
} from '@whiskeysockets/baileys'

const useSQLiteAuthState = async (file) => {

    const folder = path.dirname(file)

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
    }

    const db = new Database(file)

    db.pragma('journal_mode = WAL')

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `).run()

    const writeData = (key, value) => {
        const data = JSON.stringify(
            value,
            BufferJSON.replacer
        )

        db.prepare(`
            INSERT OR REPLACE INTO auth (key, value)
            VALUES (?, ?)
        `).run(key, data)
    }

    const readData = (key) => {

        const row = db.prepare(`
            SELECT value FROM auth
            WHERE key = ?
        `).get(key)

        if (!row?.value) return null

        return JSON.parse(
            row.value,
            BufferJSON.reviver
        )
    }

    const removeData = (key) => {
        db.prepare(`
            DELETE FROM auth
            WHERE key = ?
        `).run(key)
    }

    const creds =
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
                            type === 'app-state-sync-key' &&
                            value
                        ) {
                            value =
                                proto.Message.AppStateSyncKeyData.fromObject(value)
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
                                writeData(key, value)
                            } else {
                                removeData(key)
                            }
                        }
                    }
                }
            }
        },

        saveCreds: async () => {
            writeData('creds', creds)
        }
    }
}

export default useSQLiteAuthState
