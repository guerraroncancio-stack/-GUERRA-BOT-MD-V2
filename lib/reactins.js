import fs from 'fs'
import path from 'path'
import { promises as fsp } from 'fs'

const reactionsPath = path.resolve('./database/reacciones')

if (!fs.existsSync(reactionsPath)) {
    fs.mkdirSync(reactionsPath, { recursive: true })
}

const reactionCache = new Map()
const actionCallbacks = {}

export function initReactionSystem(conn) {

    if (conn.__reactionSystemLoaded) return
    conn.__reactionSystemLoaded = true

    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages?.[0]
            if (!m?.message?.reactionMessage) return

            const reaction = m.message.reactionMessage

            const sender =
                m.key.participant ||
                m.participant ||
                m.key.remoteJid

            await handleReaction(reaction, sender, conn)

        } catch (err) {
            console.error('❌ Error listener reacción:', err)
        }
    })

    setInterval(() => {
        clearOldReactions().catch(console.error)
    }, 60 * 60 * 1000)
}

export async function createMessageWithReactions(conn, msg, actions = {}) {
    try {
        if (!msg?.key?.id) return false

        const messageId = msg.key.id

        const serialized = {}

        for (const emoji of Object.keys(actions)) {
            serialized[emoji] = {
                type: actions[emoji]?.type || null,
                data: actions[emoji]?.data || null
            }
        }

        const payload = {
            id: messageId,
            chat: msg.key.remoteJid,
            createdAt: Date.now(),
            actions: serialized
        }

        const filepath = path.join(reactionsPath, `${messageId}.json`)

        await fsp.writeFile(filepath, JSON.stringify(payload, null, 2))

        reactionCache.set(messageId, payload)

        return true

    } catch (err) {
        console.error('❌ Error creando reacción:', err)
        return false
    }
}

async function getReactionData(messageId) {
    try {
        if (reactionCache.has(messageId)) {
            return reactionCache.get(messageId)
        }

        const filepath = path.join(reactionsPath, `${messageId}.json`)

        if (!fs.existsSync(filepath)) return null

        const raw = await fsp.readFile(filepath, 'utf8')

        const json = JSON.parse(raw)

        reactionCache.set(messageId, json)

        return json

    } catch (err) {
        console.error('❌ Error leyendo reacción:', err)
        return null
    }
}

export function setActionCallback(type, callback) {
    if (typeof callback !== 'function') {
        throw new TypeError('El callback debe ser función')
    }

    actionCallbacks[type] = callback
}

function getCallback(type) {
    return actionCallbacks[type]
}

export async function handleReaction(reaction, sender, conn) {
    try {
        if (!reaction?.key?.id) return

        const emoji = reaction.text

        if (!emoji || emoji.trim() === '') return

        const messageId = reaction.key.id

        const data = await getReactionData(messageId)

        if (!data) return

        const action = data.actions?.[emoji]

        if (!action) return

        const callback = getCallback(action.type)

        if (!callback) return

        await callback(conn, {
            reaction,
            sender,
            chat: reaction.key.remoteJid,
            data: action.data,
            messageData: data
        })

    } catch (err) {
        console.error('❌ Error procesando reacción:', err)
    }
}

export async function clearOldReactions(hours = 24) {
    try {
        const files = await fsp.readdir(reactionsPath)

        const now = Date.now()

        for (const file of files) {

            const filepath = path.join(reactionsPath, file)

            try {
                const raw = await fsp.readFile(filepath, 'utf8')

                const json = JSON.parse(raw)

                if (!json.createdAt) continue

                const diff = now - json.createdAt

                if (diff > hours * 60 * 60 * 1000) {

                    await fsp.unlink(filepath)

                    reactionCache.delete(json.id)
                }

            } catch {}
        }

    } catch (err) {
        console.error('❌ Error limpiando reacciones:', err)
    }
}

/* =======================
   EJEMPLO DE USO
=======================

import {
    initReactionSystem,
    createMessageWithReactions,
    setActionCallback
} from './lib/reactions.js'

initReactionSystem(conn)

setActionCallback('menu', async (conn, ctx) => {

    await conn.sendMessage(ctx.chat, {
        text: 'Abriste el menú 👑'
    })

})

const msg = await conn.sendMessage(m.chat, {
    text: 'Reacciona 😀'
})

await createMessageWithReactions(conn, msg, {
    '😀': {
        type: 'menu',
        data: {
            test: true
        }
    }
})

*/
