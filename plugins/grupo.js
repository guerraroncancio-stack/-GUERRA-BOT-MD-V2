export default {

    name: 'grupo',

    aliases: ['gc', 'group'],

    async execute(m, {
        conn,
        args,
        isAdmin,
        isBotAdmin
    }) {

        if (!m.isGroup) {

            return conn.sendMessage(
                m.chat,
                {
                    text: '⚠️ Este comando solo funciona en grupos.'
                }
            )

        }

        if (!isAdmin) {

            return conn.sendMessage(
                m.chat,
                {
                    text: '⚠️ Solo admins pueden usar este comando.'
                }
            )

        }

        if (!isBotAdmin) {

            return conn.sendMessage(
                m.chat,
                {
                    text: '⚠️ El bot necesita admin.'
                }
            )

        }

        const action =
        args[0]?.toLowerCase()

        if (!action) {

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 ⚔️ GROUP SETTINGS ⚔️ 〕━━⬣
┃ .grupo abrir
┃ .grupo cerrar
╰━━━━━━━━━━━━━━━━━━⬣`
                }
            )

        }

        try {

            if (action === 'abrir') {

                await conn.groupSettingUpdate(
                    m.chat,
                    'not_announcement'
                )

                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 ✅ GRUPO ABIERTO ✅ 〕━━⬣
┃ TODOS PUEDEN HABLAR
╰━━━━━━━━━━━━━━━━━━⬣`
                    }
                )

            }

            if (action === 'cerrar') {

                await conn.groupSettingUpdate(
                    m.chat,
                    'announcement'
                )

                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 🔒 GRUPO CERRADO 🔒 〕━━⬣
┃ SOLO ADMINS PUEDEN HABLAR
╰━━━━━━━━━━━━━━━━━━⬣`
                    }
                )

            }

            return conn.sendMessage(
                m.chat,
                {
                    text: '⚠️ Usa abrir o cerrar.'
                }
            )

        } catch (err) {

            console.error(err)

            return conn.sendMessage(
                m.chat,
                {
                    text: '❌ Error ejecutando comando.'
                }
            )

        }

    }

}
