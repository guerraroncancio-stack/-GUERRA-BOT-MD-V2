import fetch from 'node-fetch'
import FormData from 'form-data'

export default {

  name: 'tourl',

  alias: [
    'telegraph',
    'upload',
    'url'
  ],

  tags: ['tools'],

  command: [
    'tourl',
    'telegraph',
    'upload',
    'url'
  ],

  async run(m, { conn }) {

    try {

      // =========================
      // 📥 QUOTED
      // =========================

      const q =
      m.quoted
        ? m.quoted
        : m

      const mime =
      q.mimetype ||
      q.msg?.mimetype ||
      ''

      if (!mime) {

        return m.reply(
          '❌ Responde a una imagen o video'
        )

      }

      // =========================
      // 📦 DOWNLOAD
      // =========================

      await m.reply(
        '📤 Subiendo archivo...'
      )

      const buffer =
      await q.download()

      if (!buffer) {

        return m.reply(
          '❌ No se pudo descargar el archivo'
        )

      }

      // =========================
      // ☁️ FORM DATA
      // =========================

      const form =
      new FormData()

      form.append(
        'file',
        buffer,
        {
          filename:
          mime.includes('video')
            ? 'video.mp4'
            : 'image.jpg',

          contentType: mime
        }
      )

      // =========================
      // ☁️ UPLOAD
      // =========================

      const res =
      await fetch(
        'https://telegra.ph/upload',
        {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        }
      )

      const data =
      await res.json()

      // =========================
      // ❌ ERROR
      // =========================

      if (
        !Array.isArray(data) ||
        !data[0]?.src
      ) {

        console.log(data)

        return m.reply(
          '❌ Error al subir a Telegraph'
        )

      }

      // =========================
      // ✅ URL
      // =========================

      const url =
      'https://telegra.ph' +
      data[0].src

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭━━〔 ☁️ TELEGRAPH ☁️ 〕━━⬣
┃
┃ ✅ Archivo subido
┃
┃ 🔗 URL:
┃ ${url}
┃
╰━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
      )

    } catch (e) {

      console.log(e)

      return m.reply(
        `❌ Error:\n${e}`
      )

    }

  }

}
