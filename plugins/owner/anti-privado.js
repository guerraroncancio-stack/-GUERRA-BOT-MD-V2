const antiPrivateCommand = {

    name: 'antiprivado',
    alias: ['antipriv', 'privado', 'listblock', 'bloqueados', 'unblock', 'desbloquear'],
    category: 'owner',

    // =========================
    // 🔥 BEFORE (ANTI PRIVADO)
    // =========================

    async before(m, { conn, isOwner, isROwner }) {

        try {

            if (!m.message) return
            if (m.isGroup) return
            if (m.fromMe) return
            if (m.chat === 'status@broadcast') return

            // ❌ OWNER NO SE TOCA
            if (isOwner || isROwner) return

            const jid = m.sender

            // ❌ FILTRO DE JIDS INVÁLIDOS (CLAVE)
            if (!jid || !jid.includes('@s.whatsapp.net')) return

            global.db.data = global.db.data || {}
            global.db.data.settings = global.db.data.settings || {}

            const botNumber = conn.user?.jid || conn.user?.id

            if (!global.db.data.settings[botNumber]) {
                global.db.data.settings[botNumber] = {
                    antiPrivate: true,
                    blockedUsers: []
                }
            }

            const settings = global.db.data.settings[botNumber]

            if (!settings.antiPrivate) return

            // ❌ EVITAR DUPLICADOS
            if (!settings.blockedUsers.includes(jid)) {
                settings.blockedUsers.push(jid)
            }

            await conn.sendMessage(m.chat, {
                text:
`╭━━〔 🚫 ANTI PRIVADO 🚫 〕━━⬣
┃
┃ ❌ No puedes escribir al bot.
┃
┃ 👑 Solo el owner tiene acceso.
┃
┃ 🚷 Serás bloqueado.
╰━━━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })

            await new Promise(r => setTimeout(r, 1200))

            // 🔥 BLOQUEO SEGURO
            await conn.updateBlockStatus(jid, 'block').catch(() => {})

        } catch (e) {
            console.log('[ ANTIPRIVADO ERROR ]', e)
        }

        return false
    },

    // =========================
    // 🔥 RUN
    // =========================

    async run(m, { conn, args, command, isOwner }) {

        if (!isOwner) return m.reply('❌ Solo owner.')

        global.db.data = global.db.data || {}
        global.db.data.settings = global.db.data.settings || {}

        const botNumber = conn.user?.jid || conn.user?.id

        if (!global.db.data.settings[botNumber]) {
            global.db.data.settings[botNumber] = {
                antiPrivate: true,
                blockedUsers: []
            }
        }

        const settings = global.db.data.settings[botNumber]

        // =========================
        // ON / OFF
        // =========================

        const option = (args[0] || '').toLowerCase()

        if (option === 'on') {
            settings.antiPrivate = true
            return m.reply('🚫 AntiPrivado ACTIVADO')
        }

        if (option === 'off') {
            settings.antiPrivate = false
            return m.reply('🚫 AntiPrivado DESACTIVADO')
        }

        // =========================
        // LISTA
        // =========================

        if (command === 'bloqueados' || command === 'listblock') {

            const list = settings.blockedUsers || []

            if (!list.length) return m.reply('📭 No hay bloqueados.')

            let txt = `🚫 *BLOQUEADOS*\n\n`

            for (let u of list) {
                txt += `• wa.me/${u.split('@')[0]}\n`
            }

            return m.reply(txt)
        }

        // =========================
        // UNBLOCK
        // =========================

        if (command === 'unblock' || command === 'desbloquear') {

            let num = args[0] ||
                (m.quoted?.sender ? m.quoted.sender.split('@')[0] : null)

            if (!num) return m.reply('Uso: .desbloquear 57xxx')

            num = num.replace(/[^0-9]/g, '')
            const jid = num + '@s.whatsapp.net'

            await conn.updateBlockStatus(jid, 'unblock').catch(() => {})

            settings.blockedUsers =
                settings.blockedUsers.filter(v => v !== jid)

            return m.reply(`🔓 Desbloqueado: ${num}`)
        }
    }
}

export default antiPrivateCommand
