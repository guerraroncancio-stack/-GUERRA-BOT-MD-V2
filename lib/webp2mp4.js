import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { JSDOM } from 'jsdom'

/*
━━━━━━━━━━━━━━━━━━━━━━━
 WEBP CONVERTER
━━━━━━━━━━━━━━━━━━━━━━━

✔ webp → mp4
✔ webp → png

━━━━━━━━━━━━━━━━━━━━━━━
*/

/*
━━━━━━━━━━━━━━━━━━━━━━━
 CREATE FORM
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function createForm(source) {

  const form = new FormData()

  const isUrl =
    typeof source === 'string' &&
    /^https?:\/\//i.test(source)

  if (isUrl) {

    form.append(
      'new-image-url',
      source
    )

    form.append(
      'new-image',
      ''
    )

  } else {

    const blob = new Blob([source], {
      type: 'image/webp'
    })

    form.append(
      'new-image-url',
      ''
    )

    form.append(
      'new-image',
      blob,
      'image.webp'
    )
  }

  return form
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 WEBP → MP4
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function webp2mp4(source) {

  const form = await createForm(source)

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   UPLOAD
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const res = await fetch(
    'https://ezgif.com/webp-to-mp4',
    {
      method: 'POST',
      body: form
    }
  )

  const html = await res.text()

  const { document } =
    new JSDOM(html).window

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GET FORM DATA
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const form2 = new FormData()

  const data = {}

  for (const input of document.querySelectorAll('form input[name]')) {

    data[input.name] = input.value

    form2.append(
      input.name,
      input.value
    )
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CONVERT
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const res2 = await fetch(
    `https://ezgif.com/webp-to-mp4/${data.file}`,
    {
      method: 'POST',
      body: form2
    }
  )

  const html2 = await res2.text()

  const {
    document: document2
  } = new JSDOM(html2).window

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GET VIDEO
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const video = document2.querySelector(
    'div#output > p.outfile > video > source'
  )

  if (!video) {
    throw new Error(
      'No se pudo convertir WEBP a MP4'
    )
  }

  return new URL(
    video.src,
    res2.url
  ).toString()
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 WEBP → PNG
━━━━━━━━━━━━━━━━━━━━━━━
*/

async function webp2png(source) {

  const form = await createForm(source)

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   UPLOAD
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const res = await fetch(
    'https://ezgif.com/webp-to-png',
    {
      method: 'POST',
      body: form
    }
  )

  const html = await res.text()

  const { document } =
    new JSDOM(html).window

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GET FORM DATA
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const form2 = new FormData()

  const data = {}

  for (const input of document.querySelectorAll('form input[name]')) {

    data[input.name] = input.value

    form2.append(
      input.name,
      input.value
    )
  }

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   CONVERT
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const res2 = await fetch(
    `https://ezgif.com/webp-to-png/${data.file}`,
    {
      method: 'POST',
      body: form2
    }
  )

  const html2 = await res2.text()

  const {
    document: document2
  } = new JSDOM(html2).window

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━
   GET IMAGE
  ━━━━━━━━━━━━━━━━━━━━━━━
  */

  const image = document2.querySelector(
    'div#output > p.outfile > img'
  )

  if (!image) {
    throw new Error(
      'No se pudo convertir WEBP a PNG'
    )
  }

  return new URL(
    image.src,
    res2.url
  ).toString()
}

/*
━━━━━━━━━━━━━━━━━━━━━━━
 EXPORTS
━━━━━━━━━━━━━━━━━━━━━━━
*/

export {
  webp2mp4,
  webp2png
}
