import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

export default {

  name: 'tourl',
  alias: ['upload', 'telegraph'],

  tags: ['tools'],

  command: ['tourl', 'upload', 'telegraph'],

  async run(m, { conn }) {

    try {

      // =========================
      // 📥 MEDIA CHECK
      // =========================

      const q =
      m.quoted
        ? m.quoted
        : m

      const mime =
      (q.msg || q).mimetype || ''

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

      const media =
      await q.download()

      // =========================
      // ☁️ TELEGRAPH UPLOAD
      // =========================

      const form =
      new FormData()

      form.append(
        'file',
        media,
        'file'
      )

      const res =
      await fetch(
        'https://telegra.ph/upload',
        {
          method: 'POST',
          body: form
        }
      )

      const data =
      await res.json()

      if (!data[0]?.src) {

        return m.reply(
          '❌ Error al subir archivo'
        )

      }

      const url =
      'https://telegra.ph' +
      data[0].src

      // =========================
      // ✅ SEND URL
      // =========================

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
        '❌ Error al subir archivo'
      )

    }

  }

}
