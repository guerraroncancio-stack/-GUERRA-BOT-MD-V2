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

            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            m.sender

            // =========================================
            // ⚠️ YA ES ADMIN
            // =========================================

            if (
                who === m.sender &&
                isAdmin
            ) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 AUTOADMIN 👑 〕━━━⬣
┃ ✅ Ya eres administrador
┃ ⚡ No necesitas promoción
┗━━━━━━━━━━━━━━━━━━━━⬣`,

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
                // 👑 PROMOVER
                // =========================================

                await conn.groupParticipantsUpdate(
                    m.chat,
                    [who],
                    'promote'
                )

                let txt =

`┏━━━〔 👑 AUTOADMIN 👑 〕━━━⬣
┃
┃ 👤 Usuario
┃ ➥ @${who.split('@')[0]}
┃ ⚔️ Estado
┃ ➥ Admin otorgado
┃ 📅 Fecha
┃ ➥ ${date}
┃ ⏰ Hora
┃ ➥ ${time}
┃
┃ 🛡️ Owner verificado
┗━━━━━━━━━━━━━━━━━━━━⬣`

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

`┏━━━〔 ❌ ERROR ❌ 〕━━━⬣
┃ No se pudo promover
┃ Revisa permisos del bot
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                    m
                )

            }

        } catch (e) {

            console.error(e)

        }

    }

}

export default autoadminCommand
