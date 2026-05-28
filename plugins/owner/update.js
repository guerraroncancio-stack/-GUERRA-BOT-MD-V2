import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

const __dirname =
path.dirname(
  fileURLToPath(import.meta.url)
)

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

      // =========================================
      // 🔥 CLEAN GIT
      // =========================================

      await safeExec(
        'git reset --hard'
      )

      await safeExec(
        'git clean -fd'
      )

      // =========================================
      // 📦 UPDATE
      // =========================================

      const branch =
      args.join(' ') || ''

      const pull =
      await safeExec(
        `git pull --rebase ${branch}`
      )

      const output =
      `${pull.stdout}\n${pull.stderr}`
      .trim()

      // =========================================
      // ⚠️ UPDATE MSG
      // =========================================

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🔥 SYSTEM UPDATE 🔥 〕━━⬣
┃
┃ ⚡ Sincronizando sistema
┃ 🔄 Recargando plugins
┃ 🚀 Aplicando cambios
┃
┣━━━━━━━━━━━━━━━━━━⬣
${output.slice(0, 3000) || 'Sistema sincronizado'}
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

      // =========================================
      // 🔥 HOT RELOAD
      // =========================================

      const result =
      await reloadPlugins(conn)

      // =========================================
      // ✅ DONE
      // =========================================

      await m.react('✅')

      return conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚀 UPDATE COMPLETADO 🚀 〕━━⬣
┃
┃ ✅ Plugins recargados
┃ ✅ Comandos activos
┃ ✅ Hot Reload estable
┃ ✅ Sistema sincronizado
┃
┃ 📦 Plugins:
┃ ➥ ${result.loaded}
┃
┃ ❌ Errores:
┃ ➥ ${result.errors}
┃
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
`╭━━〔 ❌ UPDATE ERROR ❌ 〕━━⬣
┃
┃ ⚠️ Error detectado
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

// =========================================
// 🔥 SAFE EXEC
// =========================================

async function safeExec(cmd) {

  try {

    return await execAsync(cmd, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 20,
      timeout: 1000 * 60 * 5
    })

  } catch (e) {

    return {
      stdout: '',
      stderr:
      e?.stderr ||
      e?.message ||
      String(e)
    }

  }

}

// =========================================
// 🔥 HOT RELOAD ESTABLE
// =========================================

async function reloadPlugins(conn) {

  let loaded = 0
  let errors = 0

  try {

    const pluginFolder =
    path.join(
      process.cwd(),
      'plugins'
    )

    const files =
    getFiles(pluginFolder)

    for (const file of files) {

      try {

        if (!file.endsWith('.js'))
        continue

        const modulePath =
        path.resolve(file)

        // =========================================
        // 🔥 IMPORT FRESCO
        // =========================================

        await import(
          `file://${modulePath}?update=${Date.now()}`
        )

        loaded++

        console.log(
          '[ RELOADED ]',
          path.basename(file)
        )

      } catch (err) {

        errors++

        console.log(
          '[ PLUGIN ERROR ]',
          file
        )

        console.log(err)

      }

    }

    // =========================================
    // 🔥 RELOAD CORE
    // =========================================

    if (
      typeof global.reloadHandler ===
      'function'
    ) {

      try {

        await global.reloadHandler(true)

      } catch (e) {

        console.log(
          '[ CORE RELOAD ERROR ]'
        )

        console.log(e)

      }

    }

  } catch (e) {

    console.log(e)

  }

  return {
    loaded,
    errors
  }

}

// =========================================
// 📂 GET FILES
// =========================================

function getFiles(dir) {

  let results = []

  try {

    const list =
    fs.readdirSync(dir)

    for (const file of list) {

      const full =
      path.join(dir, file)

      const stat =
      fs.statSync(full)

      if (
        stat &&
        stat.isDirectory()
      ) {

        results =
        results.concat(
          getFiles(full)
        )

      } else {

        results.push(full)

      }

    }

  } catch (e) {

    console.log(e)

  }

  return results

}
