import fs from 'fs'
import path from 'path'

const cleartmp = {
    name: 'cleartmp',
    alias: ['clearcache', 'deltemp', 'clean'],
    category: 'owner',

    run: async (m, { isROwner }) => {

        if (!isROwner) {
            return m.reply('❌ Solo el owner puede usar este comando.')
        }

        await m.react('🧹')

        const dirs = [
            '/tmp',
            './tmp',
            './temp',
            './cache',
            './session',
            './sessions'
        ]

        let totalDeleted = 0
        let errors = 0

        for (const dir of dirs) {
            try {

                if (!fs.existsSync(dir)) continue

                const files = fs.readdirSync(dir)

                for (const file of files) {
                    const filePath = path.join(dir, file)

                    try {
                        const stat = fs.lstatSync(filePath)

                        if (stat.isDirectory()) {
                            fs.rmSync(filePath, { recursive: true, force: true })
                        } else {
                            fs.unlinkSync(filePath)
                        }

                        totalDeleted++

                    } catch (e) {
                        errors++
                        continue
                    }
                }

            } catch (e) {
                continue
            }
        }

        await m.react('✅')

        return m.reply(`
🧹 *LIMPIEZA COMPLETADA*

🗑️ Archivos eliminados: ${totalDeleted}
⚠️ Errores: ${errors}
📁 Directorios revisados: ${dirs.length}

✔ TMP limpiado correctamente
        `)
    }
}

export default cleartmp
