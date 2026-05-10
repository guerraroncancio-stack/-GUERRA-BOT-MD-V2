import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/*
━━━━━━━━━━━━━━━━━━━━━━━
 BUFFER → URL UPLOADER
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function fileIO(buffer) {

  const type = await fileTypeFromBuffer(buffer)

  if (!type) {
    throw new Error('No se detectó el tipo del archivo')
  }

  const { ext, mime } = type

  const form = new FormData()

  const blob = new Blob(
    [buffer],
    { type: mime }
  )

  form.append(
    'file',
    blob,
    `file.${ext}`
  )

  const res = await fetch(
    'https://file.io/?expires=1d',
    {
      method: 'POST',
      body: form
    }
  )

  const json = await res.json()

  if (!json.success) {
    throw new Error(
      json.message || 'Error subiendo archivo'
    )
  }

  return json.link
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 RESTFUL API
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function restfulAPI(input) {

  const form = new FormData()

  const buffers = Array.isArray(input)
    ? input
    : [input]

  for (const buffer of buffers) {

    const type = await fileTypeFromBuffer(buffer)

    const blob = new Blob(
      [buffer],
      {
        type: type?.mime || 'application/octet-stream'
      }
    )

    form.append(
      'file',
      blob,
      `upload.${type?.ext || 'bin'}`
    )
  }

  const res = await fetch(
    'https://storage.restfulapi.my.id/upload',
    {
      method: 'POST',
      body: form
    }
  )

  let json = await res.text()

  try {

    json = JSON.parse(json)

    if (!json.files) {
      throw json
    }

    if (!Array.isArray(input)) {
      return json.files[0].url
    }

    return json.files.map(v => v.url)

  } catch (e) {

    throw new Error(
      typeof json === 'string'
        ? json
        : 'Error en upload'
    )
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 MAIN EXPORT
━━━━━━━━━━━━━━━━━━━━━━━
*/

export default async function uploadFile(input) {

  let lastError = null

  const uploaders = [
    restfulAPI,
    fileIO
  ]

  for (const uploader of uploaders) {

    try {

      return await uploader(input)

    } catch (e) {

      console.error(
        `[UPLOAD ERROR]:`,
        e
      )

      lastError = e
    }
  }

  throw lastError || new Error('Error desconocido')
}
