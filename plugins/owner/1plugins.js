const pluginsCmd = {
    name: 'plugins',
    alias: ['plugin', 'mods', 'modules'],
    category: 'owner',

    run: async (m, { conn }) => {

        await m.react('📦')

        try {

            // 🔥 intenta leer plugins cargados globalmente
            const plugins = global.plugins || {}

            const list = Object.values(plugins)

            if (!list.length) {
                return m.reply('⚠️ No hay plugins cargados.')
            }

            let text = `📦 *PLUGINS LOADED*\n\n`
            text += `🔢 Total: ${list.length}\n\n`

            for (let p of list) {

                text += `• ${p.name || 'sin nombre'}\n`
                text += `  ├ category: ${p.category || 'unknown'}\n`
                text += `  ├ alias: ${(p.alias || []).join(', ') || 'none'}\n\n`
            }

            await m.react('✅')

            return m.reply(text)

        } catch (e) {

            console.log(e)
            await m.react('❌')
            return m.reply('❌ Error al leer plugins.')
        }
    }
}

export default pluginsCmd
