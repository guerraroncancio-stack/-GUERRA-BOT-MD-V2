const antibots = {
    name: 'antibots',
    alias: ['antibot', 'bots'],
    category: 'config',
    owner: true,

    run: async (m, { conn, args }) => {

        global.db = global.db || {}
        global.db.settings = global.db.settings || {}

        if (!args[0]) {
            return m.reply(`
╭─〔 🤖 ANTI BOTS 〕─⬣
│
│ .antibots on
│ .antibots off
│
╰──────────────⬣`)
        }

        const option = args[0].toLowerCase()

        if (option === 'on') {
            global.db.settings.antibots = true
            return m.reply('✅ AntiBots Global Activado')
        }

        if (option === 'off') {
            global.db.settings.antibots = false
            return m.reply('❌ AntiBots Global Desactivado')
        }

        m.reply('⚠️ Usa: .antibots on / off')
    }
}

export default antibots
