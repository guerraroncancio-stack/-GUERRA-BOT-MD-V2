import fs from 'fs'
import path from 'path'

const PLUGIN_DIR = './plugins'

const pluginsManager = {
    name: 'plugins',
    alias: ['pm', 'pluginmanager', 'modules'],
    category: 'owner',

    run: async (m, { conn, args, isROwner }) => {

        if (!isROwner) return m.reply('❌ Solo owner.')

        const sub = (args[0] || '').toLowerCase()

        // =========================
        // LIST PLUGINS
        // =========================
        if (!sub || sub === 'list') {

            const list = Object.keys(global.plugins || {})

            let txt = `📦 *PLUGINS MANAGER*\n\n`
            txt += `🔢 Total: ${list.length}\n\n`

            for (let p of list) {
                const plugin = global.plugins[p]

                txt += `• ${plugin.name || p}\n`
                txt += `  ├ cat: ${plugin.category || 'unknown'}\n`
                txt += `  ├ alias: ${(plugin.alias || []).join(', ') || 'none'}\n`
                txt += `  ├ status: ${global.disabledPlugins?.has(p) ? '❌ disabled' : '✅ active'}\n\n`
            }

            return m.reply(txt)
        }

        // =========================
        // RELOAD ONE PLUGIN
        // =========================
        if (sub === 'reload') {

            const name = args[1]
            if (!name) return m.reply('Uso: .plugins reload nombre.js')

            const file = path.join(PLUGIN_DIR, name)

            if (!fs.existsSync(file)) {
                return m.reply('❌ Plugin no encontrado')
            }

            try {
                delete require.cache[require.resolve(file)]
                const mod = await import(`file://${file}?update=${Date.now()}`)

                global.plugins[name] = mod.default || mod

                await m.react('🔄')
                return m.reply(`♻️ Plugin recargado: ${name}`)

            } catch (e) {
                console.log(e)
                return m.reply('❌ Error al recargar plugin')
            }
        }

        // =========================
        // DISABLE PLUGIN
        // =========================
        if (sub === 'off') {

            const name = args[1]
            if (!name) return m.reply('Uso: .plugins off nombre.js')

            global.disabledPlugins.add(name)

            return m.reply(`❌ Plugin desactivado: ${name}`)
        }

        // =========================
        // ENABLE PLUGIN
        // =========================
        if (sub === 'on') {

            const name = args[1]
            if (!name) return m.reply('Uso: .plugins on nombre.js')

            global.disabledPlugins.delete(name)

            return m.reply(`✅ Plugin activado: ${name}`)
        }

        // =========================
        // RELOAD ALL
        // =========================
        if (sub === 'reloadall') {

            try {
                const files = fs.readdirSync(PLUGIN_DIR)

                for (const file of files) {
                    const full = path.join(PLUGIN_DIR, file)

                    delete require.cache[require.resolve(full)]

                    const mod = await import(`file://${full}?update=${Date.now()}`)

                    global.plugins[file] = mod.default || mod
                }

                await m.react('♻️')
                return m.reply('✅ Todos los plugins recargados')

            } catch (e) {
                console.log(e)
                return m.reply('❌ Error en reloadall')
            }
        }
    }
}

export default pluginsManager
