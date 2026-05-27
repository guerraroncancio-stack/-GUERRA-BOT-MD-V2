import fs from 'fs'
import path from 'path'

import {
    downloadContentFromMessage
} from '@whiskeysockets/baileys'

import isAdmin from '../lib/isAdmin.js'

async function downloadMediaMessage(message, mediaType) {

    const stream =
    await downloadContentFromMessage(
        message,
        mediaType
    )

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    const extension =
    mediaType === 'image'
        ? 'jpg'
        : mediaType === 'video'
        ? 'mp4'
        : mediaType === 'document'
        ? 'bin'
        : 'dat'

    const folder =
    path.resolve('./tmp')

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        })
    }

    const filePath =
    path.join(
        folder,
        `${Date.now()}.${extension}`
    )

    fs.writeFileSync(filePath, buffer)

    return filePath
}

const plugin = {

    name: 'hidetag',

    aliases: [
        'tag',
        'notify'
    ],

    group: true,
    admin: true,
    botAdmin: true,

    async run(m, { conn, text }) {

        try {

            const chatId = m.chat
            const senderId = m.sender

            const {
                isSenderAdmin,
                isBotAdmin
            } = await isAdmin(
                conn,
                chatId,
                senderId
            )

            if (!isBotAdmin) {

                return conn.sendMessage(
                    chatId,
                    {
                        text: '⚠️ El bot necesita admin.'
                    },
                    {
                        quoted: m
                    }
                )

            }

            if (!isSenderAdmin) {

                return conn.sendMessage(
                    chatId,
                    {
                        text: '❌ Solo admins.'
                    },
                    {
                        quoted: m
                    }
                )

            }

            const metadata =
            await conn.groupMetadata(chatId)

            const mentions =
            metadata.participants.map(
                p => p.id
            )

            const quoted =
            m.quoted?.message ||
            m.msg?.contextInfo?.quotedMessage

            /* =========================
               📸 IMAGEN
            ========================= */

            if (quoted?.imageMessage) {

                const file =
                await downloadMediaMessage(
                    quoted.imageMessage,
                    'image'
                )

                await conn.sendMessage(
                    chatId,
                    {
                        image: {
                            url: file
                        },
                        caption:
                        text ||
                        quoted.imageMessage.caption ||
                        '',
                        mentions
                    }
                )

                fs.unlinkSync(file)

                return
            }

            /* =========================
               🎥 VIDEO
            ========================= */

            if (quoted?.videoMessage) {

                const file =
                await downloadMediaMessage(
                    quoted.videoMessage,
                    'video'
                )

                await conn.sendMessage(
                    chatId,
                    {
                        video: {
                            url: file
                        },
                        caption:
                        text ||
                        quoted.videoMessage.caption ||
                        '',
                        mentions
                    }
                )

                fs.unlinkSync(file)

                return
            }

            /* =========================
               📄 DOCUMENTO
            ========================= */

            if (quoted?.documentMessage) {

                const file =
                await downloadMediaMessage(
                    quoted.documentMessage,
                    'document'
                )

                await conn.sendMessage(
                    chatId,
                    {
                        document: {
                            url: file
                        },
                        fileName:
                        quoted.documentMessage.fileName ||
                        'file',
                        mimetype:
                        quoted.documentMessage.mimetype,
                        mentions,
                        caption: text || ''
                    }
                )

                fs.unlinkSync(file)

                return
            }

            /* =========================
               💬 TEXTO
            ========================= */

            const quotedText =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            text ||
            '‎'

            await conn.sendMessage(
                chatId,
                {
                    text: quotedText,
                    mentions
                },
                {
                    quoted: m
                }
            )

        } catch (err) {

            console.log(err)

            await conn.sendMessage(
                m.chat,
                {
                    text: '❌ Error en hidetag.'
                },
                {
                    quoted: m
                }
            )

        }

    }

}

export default plugin
