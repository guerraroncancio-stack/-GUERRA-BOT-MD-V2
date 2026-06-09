import { jidNormalizedUser } from '@whiskeysockets/baileys'
import phoneNumber from 'google-libphonenumber'

const phoneUtil = phoneNumber.PhoneNumberUtil.getInstance()

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

        let fotoPerfil

        try {
            fotoPerfil = await conn.profilePictureUrl(quien, 'image')
        } catch {
            fotoPerfil = 'https://api.dix.lat/me/1776379459477.png'
        }

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

        let pais = 'Desconocido'

        try {

            const numero =
                quien.split('@')[0]

            const parsed =
                phoneUtil.parse('+' + numero)

            const region =
                phoneUtil.getRegionCodeForNumber(parsed)

            pais =
                new Intl.DisplayNames(
                    ['es'],
                    { type: 'region' }
                ).of(region) || 'Desconocido'

        } catch {}

        const pareja =
            datos.casado ||
            datos.marry ||
            ''

        let menciones = [quien]

        let infoPareja =
            'ESTADO CIVIL: Soltero/a'

        if (pareja) {

            infoPareja =
                `CASADO/A CON: @${pareja.split('@')[0]}`

            menciones.push(pareja)

        }

        let infoFamilia = ''

        if (
            Array.isArray(datos.padres) &&
            datos.padres.length
        ) {

            infoFamilia +=
                `\n┝PADRES: ${datos.padres.map(v => `@${v.split('@')[0]}`).join(', ')}`

            menciones.push(...datos.padres)

        }

        if (
            Array.isArray(datos.hijos) &&
            datos.hijos.length
        ) {

            infoFamilia +=
                `\n┝HIJOS: ${datos.hijos.map(v => `@${v.split('@')[0]}`).join(', ')}`

            menciones.push(...datos.hijos)

        }

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
│ 🌎 ${pais}
│ 🎂 ${datos.age || '--'} años
│
│ 💰 ${datos.col || 0} Col
│ ⭐ ${datos.exp || 0} Exp
│ 👑 ${rango}
│ ❤️ ${pareja ? `@${pareja.split('@')[0]}` : 'Soltero/a'}
╰────────────⬣

📖 ${datos.description || 'Sin descripción'}
`

        try {

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: fotoPerfil },
                    caption: textoPerfil,
                    mentions: [...new Set(menciones)]
                },
                { quoted: m }
            )

        } catch (e) {

            console.error(e)

            await conn.sendMessage(
                m.chat,
                {
                    text: '❌ No pude generar el perfil.'
                },
                { quoted: m }
            )

        }
    }
}

export default comandoPerfil
