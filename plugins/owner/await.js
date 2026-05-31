import { format, inspect } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

const evala = {
    name: 'eval',
    alias: ['await', 'exec'],
    category: 'owner',
    rowner: true,

    run: async (m, { conn, text, args, groupMetadata }) => {
        if (!text) return m.reply('❌ Ingresa código.')

        try {

            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

            const exec = new AsyncFunction(
                'm',
                'conn',
                'args',
                'groupMetadata',
                'require',
                'process',
                'console',
                `
                return await (async () => {
                    ${text}
                })()
                `
            )

            let result = await exec(
                m,
                conn,
                args,
                groupMetadata,
                require,
                process,
                console
            )

            if (typeof result !== 'string') {
                result = inspect(result, {
                    depth: null,
                    colors: false
                })
            }

            await m.reply(result || '✅ Ejecutado.')

        } catch (err) {
            await m.reply(
                inspect(err, {
                    depth: null,
                    colors: false
                })
            )
        }
    }
}

export default evala
