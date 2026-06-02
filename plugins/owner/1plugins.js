const pluginsCmd = {
    name: 'plugins',
    alias: ['plugin', 'mods'],
    category: 'info',

    run: async (m) => {

        const plugins = global.plugins || {}
        const list = Object.keys(plugins)

        if (!list.length) {
            return m.reply('⚠️ No hay plugins cargados.')
        }

        let txt = `📦 *PLUGINS SYSTEM*\n\n`
        txt += `🔢 Total de plugins: ${list.length}\n\n`

        txt += `📂 Lista:\n`

        for (const p of list) {
            txt += `• ${p}\n`
        }

        return m.reply(txt)
    }
}

export default pluginsCmd
