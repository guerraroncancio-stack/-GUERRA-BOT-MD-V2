import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/*
━━━━━━━━━━━━━━━━━━━━━━━
 UPLOAD IMAGE / VIDEO
━━━━━━━━━━━━━━━━━━━━━━━

Soporta:
- jpg
- jpeg
- png
- webp
- mp4
- webm
- mp3
- wav

━━━━━━━━━━━━━━━━━━━━━━━
*/

export default async function uploadImage(buffer) {

  if (!buffer) {
    throw new Error('Buffer vacío')
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   DETECT FILE TYPE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const type = await fileTypeFromBuffer(buffer)

  if (!type) {
    throw new Error('No se pudo detectar el tipo de archivo')
  }

  const {
    ext,
    mime
  } = type

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   VALID MIME TYPES
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const allowedMime = [

    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',

    'video/mp4',
    'video/webm',

    'audio/mpeg',
    'audio/wav'

  ]

  if (!allowedMime.includes(mime)) {

    throw new Error(
      `Formato no soportado: ${mime}`
    )
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   FORM DATA
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const form = new FormData()

  const blob = new Blob(
    [buffer],
    { type: mime }
  )

  form.append(
    'files[]',
    blob,
    `upload.${ext}`
  )

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   REQUEST
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const res = await fetch(
    'https://qu.ax/upload.php',
    {
      method: 'POST',
      body: form
    }
  )

  if (!res.ok) {

    throw new Error(
      `Error HTTP ${res.status}`
    )
  }

  const result = await res.json()

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   VALID RESPONSE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  if (
    result &&
    result.success &&
    result.files &&
    result.files.length
  ) {

    return result.files[0].url
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   ERROR
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  console.log(result)

  throw new Error(
    'No se pudo subir el archivo a qu.ax'
  )
}
