/* =========================================
   👑 GUERRA BOT — OWNER HANDLER
========================================= */

const owner = {

    name: 'owner',

    run: async (m, {
        conn,
        command,
        text,
        args,
        isROwner
    }) => {

        switch (command) {

            /* =========================
               📢 BROADCAST
            ========================= */

            case 'bc':
            case 'broadcast': {

                if (!isROwner) return true

                if (!text) {

                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
'✘ Ingresa un mensaje.'
                        },
                        {
                            quoted: m
                        }
                    )

                    return true

                }

                const chats =
                Object.keys(
                    conn.chats || {}
                )

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`📢 Enviando broadcast a ${chats.length} chats...`
                    },
                    {
                        quoted: m
                    }
                )

                for (const jid of chats) {

                    try {

                        await conn.sendMessage(
                            jid,
                            {
                                text:
`📢 BROADCAST OFICIAL\n\n${text}`
                            }
                        )

                    } catch {}

                }

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
'✅ Broadcast enviado.'
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🚫 BAN USER
            ========================= */

            case 'ban': {

                if (!isROwner) return true

                const user =
                m.mentionedJid?.[0] ||
                m.quoted?.sender

                if (!user) {

                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
'✘ Menciona un usuario.'
                        },
                        {
                            quoted: m
                        }
                    )

                    return true

                }

                if (global.updateUser) {

                    global.updateUser(
                        user,
                        {
                            banned: true
                        }
                    )

                }

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`✅ Usuario baneado.

@${user.split('@')[0]}`,
                        mentions: [user]
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               ✅ UNBAN USER
            ========================= */

            case 'unban': {

                if (!isROwner) return true

                const user =
                m.mentionedJid?.[0] ||
                m.quoted?.sender

                if (!user) {

                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
'✘ Menciona un usuario.'
                        },
                        {
                            quoted: m
                        }
                    )

                    return true

                }

                if (global.updateUser) {

                    global.updateUser(
                        user,
                        {
                            banned: false
                        }
                    )

                }

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`✅ Usuario desbaneado.

@${user.split('@')[0]}`,
                        mentions: [user]
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🗑️ CLEAR TMP
            ========================= */

            case 'cleartmp':
            case 'tmp': {

                if (!isROwner) return true

                const fs =
                await import('fs')

                const path =
                await import('path')

                const folder =
                './tmp'

                const files =
                fs.readdirSync(folder)

                for (const file of files) {

                    const filePath =
                    path.join(folder, file)

                    try {

                        fs.unlinkSync(filePath)

                    } catch {}

                }

                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`🗑️ TMP limpiado.

📦 Archivos eliminados:
${files.length}`
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               📊 MEMORY
            ========================= */

            case 'ram':
            case 'memory': {

                if (!isROwner) return true

                const used =
                process.memoryUsage()

                const format =
                (bytes) =>
                (bytes / 1024 / 1024)
                .toFixed(2) + ' MB'

                const txt =
`📊 MEMORY USAGE

RSS:
${format(used.rss)}

HEAP TOTAL:
${format(used.heapTotal)}

HEAP USED:
${format(used.heapUsed)}

EXTERNAL:
${format(used.external)}`

                await conn.sendMessage(
                    m.chat,
                    {
                        text: txt
                    },
                    {
                        quoted: m
                    }
                )

                return true

            }

            /* =========================
               🧠 EVAL
            ========================= */

            case 'eval':
            case '>': {

                if (!isROwner) return true

                if (!text) return true

                try {

                    let evaled =
                    await eval(text)

                    if (
                        typeof evaled !==
                        'string'
                    ) {

                        evaled =
                        require('util')
                        .inspect(evaled)

                    }

                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
String(evaled)
                        },
                        {
                            quoted: m
                        }
                    )

                } catch (err) {

                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
String(err)
                        },
                        {
                            quoted: m
                        }
                    )

                }

                return true

            }

        }

        return false

    }

}

export default owner
