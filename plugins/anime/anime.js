import fetch from 'node-fetch'

const animeCommand = {
    name: 'anime',
    alias: ['animes'],
    category: 'fun',

    run: async (m, { conn }) => {

        const sleep = (ms) => new Promise(res => setTimeout(res, ms))

        const sendAlbumMessage = async (conn, jid, medias, options = {}) => {
            if (typeof jid !== "string") throw new TypeError("jid must be string")

            const caption = options.caption || options.text || ""
            const delayTime = options.delay || 500

            const album = await conn.generateWAMessageFromContent(
                jid,
                {
                    messageContextInfo: {},
                    albumMessage: {
                        expectedImageCount: medias.filter(m => m.type === "image").length,
                        expectedVideoCount: medias.filter(m => m.type === "video").length,
                        ...(options.quoted ? {
                            contextInfo: {
                                stanzaId: options.quoted.key.id,
                                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                                remoteJid: options.quoted.key.remoteJid,
                                quotedMessage: options.quoted.message,
                                fromMe: options.quoted.key.fromMe
                            }
                        } : {})
                    }
                },
                {}
            )

            await conn.relayMessage(album.key.remoteJid, album.message, {
                messageId: album.key.id
            })

            for (let i = 0; i < medias.length; i++) {
                const { type, data } = medias[i]

                try {
                    const msg = await conn.generateWAMessage(
                        album.key.remoteJid,
                        {
                            [type]: data,
                            ...(i === 0 ? { caption } : {})
                        },
                        { upload: conn.waUploadToServer }
                    )

                    msg.message.messageContextInfo = {
                        messageAssociation: {
                            associationType: 1,
                            parentMessageKey: album.key
                        }
                    }

                    await conn.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id
                    })

                    await sleep(delayTime)

                } catch (err) {
                    console.log('Error enviando media:', err)
                }
            }

            return album
        }

        try {
            const url_api = global.api || '' // por si lo tienes en global

            const res = await fetch(`${url_api}/api/search/anime?apikey=400klob`)
            const json = await res.json()

            if (!json?.status || !Array.isArray(json?.images)) {
                return conn.reply(m.chat, '❌ No se encontraron imágenes anime.', m)
            }

            const maxImgs = Math.min(json.images.length, 10)

            const medias = json.images.slice(0, maxImgs).map(url => ({
                type: 'image',
                data: { url }
            }))

            await sendAlbumMessage(conn, m.chat, medias, {
                caption: `✨ *Aquí tienes ${maxImgs} imágenes anime* ✨`,
                quoted: m
            })

        } catch (e) {
            console.error(e)
            conn.reply(m.chat, '😿 Error al obtener imágenes anime.', m)
        }
    }
}

export default animeCommand
