import axios from 'axios'
import FormData from 'form-data'

async function run(m, { conn, prefix, command }) {

  try {

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!mime)
      return m.reply(`📸 Responde a una imagen con *${prefix + command}*`)

    if (!mime.startsWith('image'))
      return m.reply('⚠️ Solo se permiten imágenes.')

    await conn.sendMessage(m.chat, {
      react: { text: '👟', key: m.key }
    })

    const media = await q.download()

    if (!media)
      return m.reply('⚠️ No se pudo descargar la imagen.')

    const enhanced = await ihancer(media, {
      method: 1,
      size: 'high'
    })

    const caption = `
╔════════════╗
║ 👑 GUERRA BOT HD
╠════════════╣
║ ✨ Imagen mejorada con IA
║ 🚀 Calidad optimizada
╚════════════╝
`

    await conn.sendMessage(m.chat, {
      image: enhanced,
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.log(e)

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

    return m.reply('⚠️ Error al procesar la imagen.')
  }
}


// =========================
// 🔥 IA ENHANCER
// =========================
async function ihancer(buffer, { method = 1, size = 'high' } = {}) {

  if (!Buffer.isBuffer(buffer))
    throw new Error('Imagen inválida')

  const form = new FormData()
  form.append('method', String(method))
  form.append('is_pro_version', 'false')
  form.append('is_enhancing_more', 'false')
  form.append('max_image_size', size)
  form.append('file', buffer, `image_${Date.now()}.jpg`)

  const { data } = await axios.post(
    'https://ihancer.com/api/enhance',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'user-agent': 'Mozilla/5.0'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    }
  )

  return Buffer.from(data)
}

export default {
  name: 'hd',
  command: ['hd', 'upscale', 'enhance'],
  group: false,
  admin: false,
  run
}
