const enable = {
    name: 'enable',
    alias: [
        'welcome', 'bv', 'detect', 'autosticker',
        'antisub', 'antilink', 'antistatus',
        'modoadmin', 'nsfw'
    ],
    category: 'config',
    admin: true,
    group: true,

    run: async function (m, { conn, args, usedPrefix }) {

        const chat = global.db.data.chats[m.chat]
        const bot = global.db.data.settings?.[conn.user.jid] || {}

        const type = (args[0] || '').toLowerCase()
        const isEnable = true

        // =========================
        // 📊 MENÚ DE ESTADO
        // =========================
        if (!type) {

            const estado = (v) => v ? '✅' : '❌'

            return m.reply(`
╭━〔 ⚙️ SYSTEM CONFIG 〕━⬣
┃ Bienvenida: ${estado(chat.welcome)}
┃ Detect: ${estado(chat.detect)}
┃ AntiLink: ${estado(chat.antiLink)}
┃ Modoadmin: ${estado(chat.modoadmin)}
┃ NSFW: ${estado(chat.nsfw)}
┃ AutoSticker: ${estado(chat.autoStickers || false)}
╰━━━━━━━━━━━━━━━━⬣`.trim())
        }

        // =========================
        // 🔐 PERMISOS BASE
        // =========================
        const group = m.isGroup
        const isAdmin = m.isGroup ? m.isAdmin : false
        const isOwner = global.owner?.includes(m.sender)

        const requireAdmin = () => {
            if (group && !(isAdmin || isOwner)) {
                return m.reply('❌ Solo admins pueden usar esto')
            }
        }

        // =========================
        // ⚙️ SWITCH SYSTEM
        // =========================
        switch (type) {

            case 'welcome':
            case 'bv':
            case 'detect':
                requireAdmin()
                chat.welcome = isEnable
                chat.detect = isEnable
                break

            case 'antilink':
                requireAdmin()
                chat.antiLink = isEnable
                break

            case 'modoadmin':
                requireAdmin()
                chat.modoadmin = isEnable
                break

            case 'nsfw':
                requireAdmin()
                chat.nsfw = isEnable
                break

            case 'autosticker':
                requireAdmin()
                chat.autoStickers = isEnable
                break

            case 'antisub':
                requireAdmin()
                chat.antisub = isEnable
                break

            default:
                return m.reply(`
⚙️ *OPCIONES DISPONIBLES*

• welcome
• detect
• antilink
• modoadmin
• nsfw
• autosticker
• antisub

📌 Ejemplo:
${usedPrefix}enable antilink
                `.trim())
        }

        return m.reply(
            `✅ *${type.toUpperCase()}* activado correctamente`
        )
    }
}

export default enable
