const pluginsCmd = {
    name: 'plugins',
    alias: ['plugin', 'mods'],
    category: 'info',

    run: async (m) => {

        const plugins = global.plugins || {}
        const total = Object.keys(plugins).length

        return m.reply(`📦 *Plugins cargados:* ${total}`)
    }
}

export default pluginsCmd
