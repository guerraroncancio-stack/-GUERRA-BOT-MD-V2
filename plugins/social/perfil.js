import { jidNormalizedUser } from '@whiskeysockets/baileys'

const comandoPerfil = {
    name: 'perfil',
    alias: ['profile', 'p', 'whoami'],
    category: 'social',

    run: async (m, { conn, participants = [] }) => {

        const quien =
            m.quoted?.sender ||
            m.mentionedJid?.[0] ||
            m.sender

        const nombreUsuario =
            m.pushName || 'Usuario'

        let datos = null

        try {
            datos = await global.User.findOne({
                $or: [
                    { id: quien },
                    { lid: quien }
                ]
            }).lean()
        } catch {}

        datos = datos || {
            name: nombreUsuario,
            exp: 0,
            col: 0,
            casado: '',
            age: 0,
            gender: '',
            identity: '',
            description: '',
            hijos: [],
            padres: []
        }

        const pareja =
            datos.casado ||
            datos.marry ||
            ''

        let menciones = [quien]

        if (pareja)
            menciones.push(pareja)

        if (Array.isArray(datos.hijos))
            menciones.push(...datos.hijos)

        if (Array.isArray(datos.padres))
            menciones.push(...datos.padres)

        const esOwner =
            Array.isArray(global.owner) &&
            global.owner.some(
                v => `${v[0]}@s.whatsapp.net` === quien
            )

        const esBot =
            jidNormalizedUser(quien) ===
            jidNormalizedUser(conn.user?.id)

        const esAdmin =
            participants.some(
                p =>
                    jidNormalizedUser(p.id) === jidNormalizedUser(quien) &&
                    (p.admin === 'admin' ||
                     p.admin === 'superadmin')
            )

        let rango = 'Usuario'

        if (esBot)
            rango = 'Bot Principal'
        else if (esOwner)
            rango = 'Owner'
        else if (esAdmin)
            rango = 'Administrador'

        const textoPerfil = `
╭─〔 👤 PERFIL 〕─⬣
│ 📝 ${datos.name || nombreUsuario}
│ 🆔 @${quien.split('@')[0]}
│ 🎂 ${datos.age || '--'} años
│
│ 💰 ${datos.col || 0} Col
│ ⭐ ${datos.exp || 0} Exp
│ 👑 ${rango}
│ ❤️ ${pareja ? `@${pareja.split('@')[0]}` : 'Soltero/a'}
╰────────────⬣

📖 ${datos.description || 'Sin descripción'}
`.trim()

        try {

            let foto = null

            try {
                foto = await conn.profilePictureUrl(
                    quien,
                    'image'
                )
            } catch {}

            if (foto) {

                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: foto
                        },
                        caption: textoPerfil,
                        mentions: [...new Set(menciones)]
                    },
                    {
                        quoted: m
                    }
                )

            } else {

                await conn.sendMessage(
                    m.chat,
                    {
                        text: textoPerfil,
                        mentions: [...new Set(menciones)]
                    },
                    {
                        quoted: m
                    }
                )

            }

        } catch (e) {

            console.error('[PERFIL ERROR]', e)

            await conn.sendMessage(
                m.chat,
                {
                    text: textoPerfil,
                    mentions: [...new Set(menciones)]
                },
                {
                    quoted: m
                }
            )

        }
    }
}

export default comandoPerfil
