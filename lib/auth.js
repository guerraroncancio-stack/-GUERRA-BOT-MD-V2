import fs from 'fs'
import path from 'path'

import {
    proto,
    initAuthCreds,
    BufferJSON
} from '@whiskeysockets/baileys'

/* =========================================
   ⚔️ GUERRA BOT AUTH SYSTEM
   STABLE FILE AUTH VERSION
========================================= */

export default function useAuthState(filePath) {

    /* =========================================
       📁 CREATE DIRECTORY
    ========================================= */

    const dir =
    path.dirname(filePath)

    if (!fs.existsSync(dir)) {

        fs.mkdirSync(dir, {
            recursive: true
        })

    }

    /* =========================================
       📖 READ SESSION FILE
    ========================================= */

    const readData = () => {

        try {

            if (
                !fs.existsSync(filePath)
            ) {

                return {
                    creds: initAuthCreds(),
                    keys: {}
                }

            }

            const raw =
            fs.readFileSync(
                filePath,
                'utf-8'
            )

            if (!raw) {

                return {
                    creds: initAuthCreds(),
                    keys: {}
                }

            }

            const parsed =
            JSON.parse(
                raw,
                BufferJSON.reviver
            )

            return {

                creds:
                parsed?.creds ||
                initAuthCreds(),

                keys:
                parsed?.keys || {}

            }

        } catch (err) {

            console.log(
                '[ AUTH READ ERROR ]',
                err?.message
            )

            return {
                creds: initAuthCreds(),
                keys: {}
            }

        }

    }

    /* =========================================
       💾 WRITE SESSION FILE
    ========================================= */

    const writeData = (data) => {

        try {

            fs.writeFileSync(
                filePath,

                JSON.stringify(
                    data,
                    BufferJSON.replacer,
                    2
                )
            )

            return true

        } catch (err) {

            console.log(
                '[ AUTH WRITE ERROR ]',
                err?.message
            )

            return false

        }

    }

    /* =========================================
       🔐 LOAD DATA
    ========================================= */

    const sessionData =
    readData()

    const creds =
    sessionData.creds

    const keys =
    sessionData.keys || {}

    /* =========================================
       ⚡ AUTH STATE
    ========================================= */

    const state = {

        creds,

        keys: {

            /* =========================================
               📥 GET KEYS
            ========================================= */

            get: async (
                type,
                ids
            ) => {

                try {

                    const data =
                    readData()

                    const result = {}

                    for (const id of ids) {

                        let value =
                        data?.keys?.[type]?.[id]

                        if (
                            type ===
                            'app-state-sync-key' &&
                            value
                        ) {

                            value =
                            proto.Message.AppStateSyncKeyData
                            .fromObject(value)

                        }

                        result[id] =
                        value || null

                    }

                    return result

                } catch (err) {

                    console.log(
                        '[ AUTH GET ERROR ]',
                        err?.message
                    )

                    return {}

                }

            },

            /* =========================================
               📤 SET KEYS
            ========================================= */

            set: async (data) => {

                try {

                    const current =
                    readData()

                    current.keys =
                    current.keys || {}

                    for (const category in data) {

                        current.keys[category] =
                        current.keys[category] || {}

                        for (const id in data[category]) {

                            const value =
                            data[category][id]

                            if (value) {

                                current.keys[category][id] =
                                value

                            } else {

                                delete current
                                .keys?.[category]?.[id]

                            }

                        }

                    }

                    current.creds =
                    creds

                    writeData(current)

                } catch (err) {

                    console.log(
                        '[ AUTH SET ERROR ]',
                        err?.message
                    )

                }

            }

        }

    }

    /* =========================================
       💾 SAVE CREDS
    ========================================= */

    const saveCreds = async () => {

        try {

            const current =
            readData()

            current.creds =
            creds

            writeData(current)

        } catch (err) {

            console.log(
                '[ SAVE CREDS ERROR ]',
                err?.message
            )

        }

    }

    /* =========================================
       🔥 AUTO BACKUP FIX
    ========================================= */

    process.on(
        'exit',
        () => {

            try {

                saveCreds()

            } catch {}

        }
    )

    process.on(
        'SIGINT',
        () => {

            try {

                saveCreds()

            } catch {}

            process.exit(0)

        }
    )

    process.on(
        'SIGTERM',
        () => {

            try {

                saveCreds()

            } catch {}

            process.exit(0)

        }
    )

    /* =========================================
       ✅ EXPORT
    ========================================= */

    return {

        state,
        saveCreds

    }

}
