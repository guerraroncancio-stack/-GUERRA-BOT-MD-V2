const welcome = {
    name: 'welcome',

    run: async () => {},

    init: (conn) => {

        conn.ev.on('group-participants.update', async (update) => {

            try {

                const { id, participants, action } = update

                global.db.data = global.db.data || {}
                global.db.data.chats = global.db.data.chats || {}

                let chat = global.db.data.chats[id]
                if (!chat) return

                if (chat.welcome === false) return

                const groupMetadata = await conn.groupMetadata(id)

                const group = groupMetadata.subject
                const desc = groupMetadata.desc || 'sin descripción'

                for (let user of participants) {

                    const tag = '@' + user.split('@')[0]

                    let text = ''

                    if (action === 'add') {
                        text = chat.sWelcome ||
                            `👋 Bienvenido ${tag} al grupo *${group}*`
                    }

                    if (action === 'remove') {
                        text = chat.sBye ||
                            `👋 ${tag} ha salido del grupo`
                    }

                    if (action === 'promote') continue
                    if (action === 'demote') continue

                    let pp
                    try {
                        pp = await conn.profilePictureUrl(user, 'image')
                    } catch {
                        pp = null
                    }

                    let img = null
                    if (pp) {
                        try {
                            const res = await fetch(pp)
                            img = Buffer.from(await res.arrayBuffer())
                        } catch {}
                    }

                    const payload = img
                        ? { image: img, caption: text, mentions: [user] }
                        : { text, mentions: [user] }

                    await conn.sendMessage(id, payload)

                }

            } catch (e) {
                console.log('[WELCOME FIX ERROR]', e)
            }

        })

    }
}

export default welcome
