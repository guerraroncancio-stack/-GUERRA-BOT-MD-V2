import { jidNormalizedUser } from '@whiskeysockets/baileys'

const safeJid = (jid) => {
    if (!jid || typeof jid !== 'string') return null
    if (!jid.includes('@s.whatsapp.net')) return null
    return jid
}

const comandoPerfil = {
    name: 'perfil',
    alias: ['profile', 'p', 'whoami'],
    category: 'social',

    run: async (m, { conn, participants }) => {

        const quien = m.quoted?.sender ||
            m.mentionedJid?.[0] ||
            m.sender

        const jid = safeJid(quien)

        const nombreUsuario = m.pushName || 'Usuario'

        // ========================
        // FOTO PERFIL SAFE
        // ========================
        let fotoPerfil
        try {
            fotoPerfil = await conn.profilePictureUrl(jid, 'image')
        } catch {
            fotoPerfil = 'https://api.dix.lat/me/1776379459477.png'
        }

        // ========================
        // USER DATA SAFE
        // ========================
        let datos = null
        try {
            datos = await global.User.findOne({
                $or: [{ id: jid }, { lid: jid }]
            })
        } catch (e) {
            datos = null
        }

        if (!datos) {
            datos = {
                name: nombreUsuario,
                exp: 0,
                col: 10,
                marry: '',
                age: 0,
                gender: '',
                identity: '',
                description: '',
                hijos: [],
                padres: []
            }
        }

        // ========================
        // PAIS SAFE (SIN FREEZE)
        // ========================
        let pais = 'Desconocido'
        try {
            const num = jid.split('@')[0]
            if (num.length >= 8 && num.length <= 15) {
                const region = new Intl.DisplayNames(['es'], { type: 'region' })
                pais = region.of('CO') || 'Desconocido'
            }
        } catch {
            pais = 'Desconocido'
        }

        // ========================
        // PAREJA SAFE
        // ========================
        let infoPareja = 'ESTADO CIVIL: Soltero/a'
        let menciones = [jid]

        const marry = safeJid(datos.marry)

        if (marry) {
            infoPareja = `CASADO/A CON: @${marry.split('@')[0]}`
            menciones.push(marry)
        }

        // ========================
        // FAMILIA SAFE
        // ========================
        let infoFamilia = ''

        if (Array.isArray(datos.padres)) {
            infoFamilia += `\n┝PADRES: ${datos.padres.map(p => safeJid(p)).filter(Boolean).map(p => `@${p.split('@')[0]}`).join(' y ')}`
            datos.padres.forEach(p => menciones.push(p))
        }

        if (Array.isArray(datos.hijos)) {
            infoFamilia += `\n┝HIJOS: ${datos.hijos.map(h => safeJid(h)).filter(Boolean).map(h => `@${h.split('@')[0]}`).join(', ')}`
            datos.hijos.forEach(h => menciones.push(h))
        }

        // ========================
        // RANGO SAFE (SIN CRASH)
        // ========================
        let rango = 'Usuario Registrado'

        try {
            const owner = global.owner || []

            const esDueño = owner.some(d => `${d[0]}@s.whatsapp.net` === jid)
            const esAdmin = Array.isArray(participants)
                ? participants.some(p =>
                    jidNormalizedUser(p.id) === jid &&
                    (p.admin === 'admin' || p.admin === 'superadmin')
                )
                : false

            if (esDueño) rango = 'Desarrollador / Owner'
            else if (esAdmin) rango = 'Administrador del Grupo'
        } catch {
            rango = 'Usuario Registrado'
        }

        // ========================
        // TEXTO
        // ========================
        const textoPerfil = `
*PERFIL DE USUARIO*

╭NOMBRE: ${datos.name || nombreUsuario}
├EDAD: ${datos.age || '--'} años
├PAIS: ${pais}
├ID: @${jid.split('@')[0]}
╰━━━━━━━━━━
╭GENERO: ${datos.gender || 'No definido'}
├ORIENTACION: ${datos.identity || 'No definido'}
╰━━━━━━━━
╭MONEDAS: ${datos.col ?? 0} Col
├EXPERIENCIA: ${datos.exp ?? 0} EXP
├${infoPareja}${infoFamilia}
├RANGO: ${rango}
╰━━━━━━━━
╭DESCRIPCION:
╰➠ ${datos.description || 'Sin descripcion configurada.'}
`

        // ========================
        // SEND SAFE
        // ========================
        try {
            await conn.sendMessage(m.chat, {
                image: { url: fotoPerfil },
                caption: textoPerfil,
                mentions: [...new Set(menciones)].filter(Boolean)
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error al generar el perfil.')
        }
    }
}

export default comandoPerfil
