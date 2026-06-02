const antiPrivateCommand = {

    name: 'antiprivado',
    alias: ['antipriv', 'privado', 'bloqueados', 'unblock', 'desbloquear'],
    category: 'owner',

    // =========================
    // 🔥 UTILITIES
    // =========================

    getOwners(conn) {
        const a = global.owner || []
        const b = a.map(v => v[0] + '@s.whatsapp.net')
        const c = conn.user?.id ? [conn.user.id] : []
        return [...new Set([...b, ...c])]
    },

    isValidJid(jid = '') {
        return typeof jid === 'string' && jid.endsWith('@s.whatsapp.net')
    },

    // =========================
    // 🔥 BEFORE (ANTI PRIVADO)
    // =========================

    async before(m, { conn }) {

        try {

            if (!m.message) return
            if (m.isGroup) return
            if (m.chat === 'status@broadcast') return

            const jid = m.sender

            // ❌ SOLO JIDS REALES
            if (!this.isValidJid(jid)) return

            const owners = this.getOwners(conn)

            // ❌ OWNER NO TOCAR
            if (owners.includes(jid)) return

            global.db.data = global.db.data || {}
            global.db.data.settings = global.db.data.settings || {}

            const botId = conn.user?.id || 'default'

            if (!global.db.data.settings[botId]) {
                global.db.data.settings[botId] = {
                    antiPrivate: true,
                    blockedUsers: []
                }
            }

            const settings = global.db.data.settings[botId]

            if (!settings.antiPrivate) return

            // ❌ EVITAR DUPLICADOS
            if (!settings.blockedUsers.includes(jid)) {
                settings.blockedUsers.push(jid)
            }

            await conn.sendMessage(m.chat, {
                text:
`╭━━〔 🚫 ANTI PRIVADO PRO MAX 🚫 〕━━⬣
┃
┃ ❌ Este bot no recibe mensajes
┃ en privado.
┃
┃ 👑 Solo el owner puede usarlo.
┃
┃ 🚷 Serás bloqueado automáticamente.
╰━━━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })

            await new Promise(r => setTimeout(r, 1000))

            await conn.updateBlockStatus(jid, 'block').catch(() => {})

        } catch (e) {
            console.log('[ ANTIPRIVADO ERROR ]', e)
        }

        return false
    },

    // =========================
    // 🔥 RUN (CONTROL PANEL)
    // =========================

    async run(m, { conn, args, command }) {

        const owners = this.getOwners(conn)

        if (!owners.includes(m.sender)) {
            return m.reply('❌ Solo owner.')
        }

        global.db.data = global.db.data || {}
        global.db.data.settings = global.db.data.settings || {}

        const botId = conn.user?.id || 'default'

        if (!global.db.data.settings[botId]) {
            global.db.data.settings[botId] = {
                antiPrivate: true,
                blockedUsers: []
            }
        }

        const settings = global.db.data.settings[botId]

        const option = (args[0] || '').toLowerCase()

        // =========================
        // ON / OFF
        // =========================

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

        if (command === 'bloqueados') {

            const list = settings.blockedUsers || []

            if (!list.length) return m.reply('📭 No hay bloqueados.')

            let txt = `🚫 *USUARIOS BLOQUEADOS*\n\n`

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
