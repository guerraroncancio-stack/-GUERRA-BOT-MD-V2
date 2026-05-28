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

      // =========================
      // 📦 GIT PULL
      // =========================

      const { stdout, stderr } =
      await execAsync(
        `git pull ${args.join(' ')}`
      )

      const output =
      `${stdout}\n${stderr}`.trim()

      // =========================
      // ⚠️ SIN CAMBIOS
      // =========================

      if (
        /Already up[ -]to[ -]date/i
        .test(output)
      ) {

        // 🔥 AUN ASÍ RECARGA
        await reloadPlugins(conn)

        await m.react('✅')

        return conn.sendMessage(
          m.chat,
          {
            text:
`╭━━〔 ✅ SYSTEM UPDATE 〕━━⬣
┃
┃ ⚡ Sistema actualizado
┃ 📦 No había cambios nuevos
┃ 🔄 Plugins recargados
┃ 🚀 Bot optimizado
┃
╰━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: m }
        )

      }

      // =========================
      // 🔥 MENSAJE UPDATE
      // =========================

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 📦 UPDATE COMPLETO 〕━━⬣
┃
┃ ⚡ Nuevos cambios detectados
┃ 🔄 Recargando comandos...
┃ 🚀 Aplicando optimización
┃
┣━━━━━━━━━━━━━━━━━━⬣
${output.slice(0, 3500)}
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

      // =========================
      // 🔥 RECARGAR PLUGINS
      // =========================

      await reloadPlugins(conn)

      await m.react('✅')

      return conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 🚀 UPDATE FINALIZADO 〕━━⬣
┃
┃ ✅ Plugins recargados
┃ ✅ Nuevos comandos activos
┃ ✅ Sistema sincronizado
┃ ✅ Hot Reload completado
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
`╭━━〔 ❌ UPDATE ERROR 〕━━⬣
┃
┃ ⚠️ Error al actualizar
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
// 🔥 HOT RELOAD REAL
// =========================================

async function reloadPlugins(conn) {

  try {

    const pluginFolder =
    path.join(
      process.cwd(),
      'plugins'
    )

    const files =
    getFiles(pluginFolder)

    for (const file of files) {

      if (!file.endsWith('.js'))
      continue

      try {

        const modulePath =
        path.resolve(file)

        // 🔥 BORRAR CACHE
        const resolved =
        await import(
          `file://${modulePath}?update=${Date.now()}`
        )

        // 🔥 SI EXISTE HANDLER
        if (
          resolved?.default?.name
        ) {

          console.log(
            '[ HOT-RELOAD ]',
            resolved.default.name
          )

        }

      } catch (err) {

        console.log(
          '[ ERROR LOADING ]',
          file
        )

        console.log(err)

      }

    }

    // 🔥 RELOAD HANDLER GLOBAL
    if (global.reloadHandler) {

      await global.reloadHandler(true)

    }

  } catch (e) {

    console.log(e)

  }

}

// =========================================
// 📂 LEER ARCHIVOS RECURSIVOS
// =========================================

function getFiles(dir) {

  let results = []

  const list =
  fs.readdirSync(dir)

  for (const file of list) {

    const full =
    path.join(dir, file)

    const stat =
    fs.statSync(full)

    if (stat && stat.isDirectory()) {

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
