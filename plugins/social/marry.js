const matrimonio = {
    name: 'matrimonio',
    alias: ['marry', 'casar', 'divorce', 'divorcio', 'aceptar', 'rechazar'],
    category: 'social',

    run: async (m, { conn, text, command, user, usedPrefix }) => {

        global.weddingGames = global.weddingGames || {}

        // =========================
        // VALID USER
        // =========================
        if (!user) {
            return m.reply('*♛ ERROR ✧*\n╰❒ Usuario no cargado.')
        }

        const cmd = (command || '').toLowerCase()
        const chat = m.chat

        // =========================
        // SAFE JID FUNCTION
        // =========================
        const jid = (id) => {
            if (!id) return null
            if (typeof id !== 'string') return null
            if (!id.includes('@s.whatsapp.net')) return null
            return id
        }

        const sender = jid(user.lid || user.id || m.sender)

        // =========================
        // GET TARGET USER
        // =========================
        const getTarget = async (input) => {
            if (!input) return null

            let num = input.replace(/\D/g, '')
            if (!num) return null

            let j = `${num}@s.whatsapp.net`

            let obj = await global.User.findOne({
                $or: [{ id: j }, { lid: j }]
            })

            return obj
        }

        // =========================
        // CHECK EXISTING MARRIAGE
        // =========================
        const checkMarry = async () => {

            if (user.marry) {
                const mjid = jid(user.marry)

                if (mjid) {
                    return conn.sendMessage(chat, {
                        text: `*♛ AVISO ✧*\n╰❒ Ya estás casado con @${mjid.split('@')[0]}.`,
                        mentions: [mjid]
                    }, { quoted: m })
                }
            }
        }

        // =========================
        // ACCEPT / REJECT SYSTEM
        // =========================
        if (cmd === 'aceptar' || cmd === 'rechazar') {

            const keys = Object.keys(global.weddingGames)
            let game = null
            let gameId = null

            for (let k of keys) {
                if (global.weddingGames[k]?.receptor === sender || global.weddingGames[k]?.solicitante === sender) {
                    game = global.weddingGames[k]
                    gameId = k
                    break
                }
            }

            if (!game) {
                return m.reply('*♛ ERROR ✧*\n╰❒ No tienes solicitudes activas.')
            }

            clearTimeout(game.timeout)

            const A = jid(game.solicitante)
            const B = jid(game.receptor)

            if (!A || !B) {
                delete global.weddingGames[gameId]
                return m.reply('*♛ ERROR ✧*\n╰❒ JIDs inválidos.')
            }

            // =========================
            // ACCEPT
            // =========================
            if (cmd === 'aceptar') {

                if (game.tipo === 'divorcio') {

                    await global.User.updateOne({ id: A }, { $set: { marry: '', marryDate: 0 } })
                    await global.User.updateOne({ id: B }, { $set: { marry: '', marryDate: 0 } })

                    delete global.weddingGames[gameId]

                    return m.reply('*♛ DIVORCIO COMPLETADO ✧*')
                }

                const uA = await global.User.findOne({ $or: [{ id: A }, { lid: A }] })
                const uB = await global.User.findOne({ $or: [{ id: B }, { lid: B }] })

                if (!uA || !uB) {
                    delete global.weddingGames[gameId]
                    return m.reply('*♛ ERROR ✧*\n╰❒ Usuarios no encontrados.')
                }

                if (uA.marry || uB.marry) {
                    delete global.weddingGames[gameId]
                    return m.reply('*♛ ERROR ✧*\n╰❒ Uno ya está casado.')
                }

                await global.User.updateOne({ _id: uA._id }, { $set: { marry: B, marryDate: Date.now() } })
                await global.User.updateOne({ _id: uB._id }, { $set: { marry: A, marryDate: Date.now() } })

                delete global.weddingGames[gameId]

                return conn.sendMessage(chat, {
                    text: `*♛ BODA COMPLETADA ✧*\n\n╰❒ @${A.split('@')[0]} 💍 @${B.split('@')[0]}`,
                    mentions: [A, B]
                }, { quoted: m })
            }

            // =========================
            // REJECT
            // =========================
            if (cmd === 'rechazar') {
                delete global.weddingGames[gameId]
                return m.reply('*♛ RECHAZADO ✧*')
            }
        }

        // =========================
        // TARGET DETECTION
        // =========================
        let target =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            (text ? text : null)

        let obj = await getTarget(target)

        if (!obj) {
            return m.reply('*♛ ERROR ✧*\n╰❒ Usuario inválido o no registrado.')
        }

        const targetJid = jid(obj.id || obj.lid)

        if (!targetJid || targetJid === sender) {
            return m.reply('*♛ ERROR ✧*\n╰❒ Menciona un usuario válido.')
        }

        await checkMarry()

        if (obj.marry) {
            return conn.sendMessage(chat, {
                text: `*♛ AVISO ✧*\n╰❒ Ese usuario ya está casado.`,
            }, { quoted: m })
        }

        // =========================
        // CREATE GAME
        // =========================
        const gameId = `${chat}-${targetJid}`

        global.weddingGames[gameId] = {
            tipo: 'boda',
            solicitante: sender,
            receptor: targetJid,
            timeout: setTimeout(() => {
                delete global.weddingGames[gameId]
                conn.sendMessage(chat, {
                    text: `*♛ TIEMPO AGOTADO ✧*\n╰❒ La propuesta expiró.`,
                    mentions: [targetJid].filter(Boolean)
                })
            }, 30000)
        }

        return conn.sendMessage(chat, {
            text: `*♛ PROPUESTA ✧*\n\n╰❒ @${sender.split('@')[0]} 💍 @${targetJid.split('@')[0]}\n\n> Responde con aceptar o rechazar.`,
            mentions: [sender, targetJid].filter(Boolean)
        }, { quoted: m })
    }
}

export default matrimonio
