import { getRealJid } from '../../lib/identifier.js'

const safeJid = (jid) => {
    if (!jid) return null
    if (typeof jid !== 'string') return null
    if (!jid.includes('@s.whatsapp.net')) return null
    return jid
}

const matrimonio = {
    name: 'matrimonio',
    alias: ['marry', 'casar', 'divorce', 'divorcio', 'aceptar', 'rechazar'],
    category: 'social',

    run: async (m, { conn, text, command, user, usedPrefix }) => {

        global.weddingGames = global.weddingGames || {}

        if (!user) {
            return m.reply('*♛ ERROR ✧*\n\n╰❒ Perfil no cargado. Escribe algo más para registrarte.')
        }

        const emisorReal = user.lid || user.id || m.sender
        const llaveChat = m.chat
        const cmd = command.trim().toLowerCase()

        // ===== MARRY CHECK =====
        if (cmd === 'marry' || cmd === 'casar') {

            const casadoCon = safeJid(user.marry)

            if (casadoCon) {
                return conn.sendMessage(m.chat, {
                    text: `*♛ AVISO ✧*\n\n╰❒ Ya estás casado con @${casadoCon.split('@')[0]}.`,
                    contextInfo: {
                        mentionedJid: [casadoCon]
                    }
                }, { quoted: m })
            }
        }

        // ===== ACCEPT / REJECT =====
        if (cmd === 'aceptar' || cmd === 'rechazar') {

            const idsPosibles = [m.sender, emisorReal]
            let idJuego = null
            let juego = null

            for (let id of idsPosibles) {
                if (global.weddingGames[`${llaveChat}-${id}`]) {
                    idJuego = `${llaveChat}-${id}`
                    juego = global.weddingGames[idJuego]
                    break
                }
            }

            if (!juego) return m.reply('*♛ AVISO ✧*\n\n╰❒ No tienes peticiones pendientes.')

            const parejaA = await global.User.findOne({ $or: [{ id: juego.solicitante }, { lid: juego.solicitante }] })
            const parejaB = await global.User.findOne({ $or: [{ id: juego.receptor }, { lid: juego.receptor }] })

            if (!parejaA || !parejaB) {
                delete global.weddingGames[idJuego]
                return m.reply('*♛ ERROR ✧*\n\n╰❒ Usuarios no válidos.')
            }

            const idA = safeJid(parejaA.lid || parejaA.id)
            const idB = safeJid(parejaB.lid || parejaB.id)

            if (!idA || !idB) {
                delete global.weddingGames[idJuego]
                return m.reply('*♛ ERROR ✧*\n\n╰❒ JIDs inválidos.')
            }

            if (cmd === 'aceptar') {

                clearTimeout(juego.timeout)

                if (juego.tipo === 'divorcio') {
                    await global.User.updateOne({ _id: parejaA._id }, { $set: { marry: '', marryDate: 0 } })
                    await global.User.updateOne({ _id: parejaB._id }, { $set: { marry: '', marryDate: 0 } })

                    delete global.weddingGames[idJuego]

                    return m.reply('*♛ DIVORCIO FINALIZADO ✧*')
                }

                if (parejaA.marry || parejaB.marry) {
                    delete global.weddingGames[idJuego]
                    return m.reply('*♛ ERROR ✧*\n\n╰❒ Uno ya está casado.')
                }

                await global.User.updateOne({ _id: parejaA._id }, { $set: { marry: idB, marryDate: Date.now() } })
                await global.User.updateOne({ _id: parejaB._id }, { $set: { marry: idA, marryDate: Date.now() } })

                delete global.weddingGames[idJuego]

                return conn.sendMessage(m.chat, {
                    text: `*♛ BODA FINAL ✧*\n\n╰❒ @${idA.split('@')[0]} 💍 @${idB.split('@')[0]}`,
                    contextInfo: {
                        mentionedJid: [idA, idB]
                    }
                }, { quoted: m })
            }

            if (cmd === 'rechazar') {
                clearTimeout(juego.timeout)
                delete global.weddingGames[idJuego]
                return m.reply('*♛ RECHAZADO ✧*')
            }
        }

        // ===== MENCIONES SEGURAS =====
        let quien =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

        quien = safeJid(quien)

        if (!quien || quien === m.sender) {
            return m.reply('*♛ ERROR ✧*\n\n╰❒ Menciona a alguien válido.')
        }

        const objetivo = await global.User.findOne({
            $or: [{ id: quien }, { lid: quien }]
        })

        if (!objetivo) {
            return m.reply(`*♛ ERROR ✧*\n\n╰❒ Usuario no registrado.`)
        }

        const idObjetivo = safeJid(objetivo.lid || objetivo.id)

        if (!idObjetivo) {
            return m.reply('*♛ ERROR ✧*\n\n╰❒ JID inválido.')
        }

        const idJuegoBoda = `${llaveChat}-${idObjetivo}`

        global.weddingGames[idJuegoBoda] = {
            tipo: 'boda',
            solicitante: emisorReal,
            receptor: idObjetivo,
            timeout: setTimeout(() => {
                delete global.weddingGames[idJuegoBoda]
                conn.sendMessage(m.chat, {
                    text: `*♛ TIEMPO AGOTADO ✧*`,
                    mentions: [idObjetivo]
                })
            }, 30000)
        }

        return conn.sendMessage(m.chat, {
            text: `*♛ PROPUESTA ✧*\n\n╰❒ @${emisorReal.split('@')[0]} 💍 @${idObjetivo.split('@')[0]}`,
            contextInfo: {
                mentionedJid: [emisorReal, idObjetivo].filter(Boolean)
            }
        }, { quoted: m })
    }
}

export default matrimonio
