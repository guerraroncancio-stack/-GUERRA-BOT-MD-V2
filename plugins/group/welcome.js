import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const { version } = await fetchLatestBaileysVersion()

global.conn = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    emitOwnEvents: true
})

conn.ev.on('creds.update', saveCreds)

// =========================
// DB SAFE
// =========================
global.db = global.db || { data: { chats: {}, users: {} } }

// =========================
// PLUGINS
// =========================
global.plugins = global.plugins || []

// =========================
// MESSAGE HANDLER
// =========================
conn.ev.on('messages.upsert', async ({ messages }) => {

    for (let m of messages) {

        if (!m.message) continue

        const chatId = m.key.remoteJid

        const msg = {
            ...m,
            chat: chatId,
            sender: m.key.participant || m.key.remoteJid,
            isGroup: chatId.endsWith('@g.us')
        }

        // ejecutar plugins tipo run/before
        for (let p of global.plugins) {
            try {
                if (p.before) await p.before(msg, { conn })
                if (p.run) await p.run(msg, { conn })
            } catch (e) {
                console.log('[PLUGIN ERROR]', e)
            }
        }
    }
})

// =========================
// GROUP EVENTS (WELCOME FIJO)
// =========================
conn.ev.on('group-participants.update', async (update) => {

    try {

        const { id, participants, action } = update

        global.db.data.chats[id] = global.db.data.chats[id] || {}
        const chat = global.db.data.chats[id]

        if (chat.welcome === false) return

        for (let user of participants) {

            let text = ''

            if (action === 'add') {
                text = chat.sWelcome || `👋 Bienvenido @${user.split('@')[0]}`
            }

            if (action === 'remove') {
                text = chat.sBye || `👋 @${user.split('@')[0]} salió`
            }

            await conn.sendMessage(id, {
                text,
                mentions: [user]
            })

        }

    } catch (e) {
        console.log('[GROUP EVENT ERROR]', e)
    }

})

// =========================
// STUB EVENTS (ANTI LINK ETC)
// =========================
conn.ev.on('messages.upsert', async ({ messages }) => {

    for (let m of messages) {

        if (!m.messageStubType) continue

        for (let p of global.plugins) {
            try {
                if (p.before) await p.before(m, { conn })
            } catch (e) {
                console.log('[STUB ERROR]', e)
            }
        }
    }
})
