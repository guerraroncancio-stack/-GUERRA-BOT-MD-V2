```js
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const execAsync = promisify(exec)

const updateCommand = {

  name: 'update',

  alias: [
    'actualizar',
    'up',
    'sync'
  ],

  category: 'owner',

  rowner: true,

  async run(m, { conn, args }) {

    try {

      await m.react('🔄')

      // =====================================
      // 📦 GIT PULL
      // =====================================

      const { stdout, stderr } =
      await execAsync(
        `git pull ${args.join(' ')}`
      )

      const output =
      `${stdout}\n${stderr}`.trim()

      // =====================================
      // 🔥 HOT RELOAD
      // =====================================

      const total =
      await reloadPlugins()

      // =====================================
      // ✅ MENSAJE FINAL
      // =====================================

      await m.react('✅')

      return conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚀 SYSTEM UPDATE 〕━━⬣
┃
┃ ✅ Actualización completada
┃ 🔄 Plugins recargados
┃ 📦 Total cargados: ${total}
┃ ⚡ Sistema sincronizado
┃
┣━━━━━━━━━━━━━━━━━━⬣
${output.slice(0, 3000) || 'Sin cambios nuevos'}
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

    } catch (e) {

      console.log(e)

      await m.react('❌')

      return conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 ❌ UPDATE ERROR 〕━━⬣
┃
┃ ⚠️ Error durante update
┃
┣━━━━━━━━━━━━━━━━━━⬣
${String(e).slice(0, 3000)}
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

    }

  }

}

export default updateCommand

// =====================================
// 🔥 HOT RELOAD UNIVERSAL
// =====================================

async function reloadPlugins() {

  try {

    // =====================================
    // 📂 POSIBLES CARPETAS
    // =====================================

    const folders = [
      'plugins',
      'handler',
      'commands',
      'src/plugins',
      'src/handler'
    ]

    let totalLoaded = 0

    for (const folder of folders) {

      const fullPath =
      path.join(process.cwd(), folder)

      // ✅ SI NO EXISTE NO ROMPE
      if (!fs.existsSync(fullPath))
      continue

      const files =
      getFiles(fullPath)

      for (const file of files) {

        if (!file.endsWith('.js'))
        continue

        try {

          const modulePath =
          path.resolve(file)

          // 🔥 IMPORT FRESCO
          const imported =
          await import(
            `file://${modulePath}?reload=${Date.now()}`
          )

          if (imported?.default?.name) {

            totalLoaded++

            console.log(
              `[ HOT-RELOAD ] ${imported.default.name}`
            )

          }

        } catch (err) {

          console.log(
            `[ ERROR ] ${file}`
          )

          console.log(err)

        }

      }

    }

    // =====================================
    // 🔥 RELOAD GLOBAL
    // =====================================

    if (global.reloadHandler) {

      await global.reloadHandler(true)

    }

    return totalLoaded

  } catch (e) {

    console.log(e)

    return 0

  }

}

// =====================================
// 📂 LEER ARCHIVOS RECURSIVOS
// =====================================

function getFiles(dir) {

  let results = []

  if (!fs.existsSync(dir))
  return results

  const list =
  fs.readdirSync(dir)

  for (const file of list) {

    const full =
    path.join(dir, file)

    let stat

    try {

      stat =
      fs.statSync(full)

    } catch {

      continue

    }

    if (stat.isDirectory()) {

      results =
      results.concat(
        getFiles(full)
      )

    } else {

      results.push(full)

    }

  }

  return results

}
```
