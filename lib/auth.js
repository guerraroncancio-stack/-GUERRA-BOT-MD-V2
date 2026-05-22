import Database from 'better-sqlite3'

import {
    proto,
    BufferJSON,
    initAuthCreds
} from '@whiskeysockets/baileys'

/* =========================================
   SQLITE AUTH STATE
========================================= */

export default function useSQLiteAuthState(dbPath) {

    const db = new Database(dbPath)

    /* =========================================
       SQLITE OPTIMIZATION
    ========================================= */

    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('temp_store = MEMORY')
    db.pragma('cache_size = -16000')

    db.prepare(`
        CREATE TABLE IF NOT EXISTS auth (
            id TEXT PRIMARY KEY,
            value TEXT
        )
    `).run()

    /* =========================================
       HELPERS
    ========================================= */

    const writeData = (id, data) => {

        try {

            const json =
            JSON.stringify(
                data,
                BufferJSON.replacer
            )

            db.prepare(`
                INSERT OR REPLACE INTO auth
                (id, value)
                VALUES (?, ?)
            `).run(id, json)

        } catch (err) {

            console.error(
                '[ AUTH WRITE ERROR ]',
                err
            )

        }

    }

    const readData = (id) => {

        try {

            const row =
            db.prepare(`
                SELECT value
                FROM auth
                WHERE id = ?
            `).get(id)

            if (!row?.value) return null

            return JSON.parse(
                row.value,
                BufferJSON.reviver
            )

        } catch (err) {

            console.error(
                '[ AUTH READ ERROR ]',
                err
            )

            return null

        }

    }

    const removeData = (id) => {

        try {

            db.prepare(`
                DELETE FROM auth
                WHERE id = ?
            `).run(id)

        } catch (err) {

            console.error(
                '[ AUTH DELETE ERROR ]',
                err
            )

        }

    }

    /* =========================================
       CREDS
    ========================================= */

    const creds =
    readData('creds') ||
    initAuthCreds()

    /* =========================================
       STATE
    ========================================= */

    const state = {

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
                        proto.Message
                        .AppStateSyncKeyData
                        .fromObject(value)

                    }

                    data[id] = value || null

                }

                return data

            },

            set: async (data) => {

                try {

                    const transaction =
                    db.transaction(() => {

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

                    })

                    transaction()

                } catch (err) {

                    console.error(
                        '[ AUTH SET ERROR ]',
                        err
                    )

                }

            }

        }

    }

    /* =========================================
       SAVE CREDS
    ========================================= */

    const saveCreds = async () => {

        try {

            writeData(
                'creds',
                creds
            )

        } catch (err) {

            console.error(
                '[ SAVE CREDS ERROR ]',
                err
            )

        }

    }

    /* =========================================
       SAFE CLOSE
    ========================================= */

    process.on('exit', () => {
        try {
            db.close()
        } catch {}
    })

    process.on('SIGINT', () => {
        try {
            db.close()
        } catch {}
        process.exit(0)
    })

    process.on('SIGTERM', () => {
        try {
            db.close()
        } catch {}
        process.exit(0)
    })

    return {
        state,
        saveCreds
    }

}
