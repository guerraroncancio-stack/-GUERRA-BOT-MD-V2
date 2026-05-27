const autoadminCommand = {

    name: 'autoadmin',

    alias: [
        'dameadmin',
        'selfadmin',
        'hacermeadmin',
        'daradmin'
    ],

    category: 'owner',

    group: true,

    run: async (
        m,
        {
            conn,
            isAdmin,
            isBotAdmin
        }
    ) => {

        try {

            const isOwner =
            global.owner
            .map(v => v[0] + '@s.whatsapp.net')
            .includes(m.sender)

            if (!isOwner) {

                global.dfail(
                    'owner',
                    m,
                    conn
                )

                return

            }

            if (!isBotAdmin) {

                global.dfail(
                    'botAdmin',
                    m,
                    conn
                )

                return

            }

            let who =

            m.mentionedJid &&
            m.mentionedJid[0]

            ? m.mentionedJid[0]

            : m.quoted

            ? m.quoted.sender

            : m.sender

            // =========================================
            // ✅ ALREADY ADMIN
            // =========================================

            if (
                who === m.sender &&
                isAdmin
            ) {

                return conn.reply(
                    m.chat,

`╭━━〔 👑 𝐆𝐔𝐄𝐑𝐑𝐀 𝐒𝐘𝐒𝐓𝐄𝐌 👑 〕━━⬣
┃ ⚠️ Ya eres administrador
┃ 🚀 No es necesario promoverte
┃ 🛡️ Estado verificado correctamente
╰━━━━━━━━━━━━━━━━━━⬣`,

                    m
                )

            }

            let d = new Date()

            let time =
            d.toLocaleTimeString(
                'es-CO',
                {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }
            )

            let date =
            d.toLocaleDateString(
                'es-CO'
            )

            try {

                // =========================================
                // 👑 PROMOTE USER
                // =========================================

                await conn.groupParticipantsUpdate(
                    m.chat,
                    [who],
                    'promote'
                )

                let txt =

`╭━━〔 👑 𝐀𝐔𝐓𝐎 𝐀𝐃𝐌𝐈𝐍 👑 〕━━⬣
┃ 👤 Usuario:
┃ ➠ @${who.split('@')[0]}
┃ ⚡ Estado:
┃ ➠ Administrador otorgado
┃ 📅 Fecha:
┃ ➠ ${date}
┃ ⏰ Hora:
┃ ➠ ${time}

┃ 🛡️ Owner verificado correctamente
╰━━━━━━━━━━━━━━━━━━⬣`

                await conn.reply(
                    m.chat,
                    txt,
                    m,
                    {
                        mentions: [who]
                    }
                )

            } catch (err) {

                console.error(err)

                conn.reply(

                    m.chat,

`╭━━〔 ❌ ERROR SYSTEM ❌ 〕━━⬣
┃ No se pudo completar
┃ la promoción del usuario
┃ Verifica que el bot
┃ tenga permisos de admin
╰━━━━━━━━━━━━━━━━━━⬣`,

                    m
                )

            }

        } catch (e) {

            console.error(e)

        }

    }

}

export default autoadminCommand
