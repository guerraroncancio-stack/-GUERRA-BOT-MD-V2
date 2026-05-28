import fetch from 'node-fetch'

// =========================================
// 👑 GUERRA CODE AI
// =========================================

const codeAICommand = {

    name: 'codeai',

    alias: [
        'dev',
        'codigo',
        'fix',
        'coder',
        'programar'
    ],

    category: 'ai',

    cooldown: 5,

    async run(m, {
        conn,
        text
    }) {

        // =========================================
        // ❌ SIN TEXTO
        // =========================================

        if (!text) {

            return conn.reply(

                m.chat,

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 💻 Asistente de programación
┃ ⚡ Especialista en desarrollo
┃ 👑 Creador: Kevin Guerra
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃ ➥ .dev crea un menú
┃ ➥ .fix error baileys
┃ ➥ .codigo bot whatsapp
┃ ➥ .coder api nodejs
╰━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 💻 REACT
            // =========================================

            await m.react('💻')

            const lower =
            text.toLowerCase()

            let answer = null

            // =========================================
            // 👑 RESPUESTA CREADOR
            // =========================================

            if (

                lower.includes('quien te creo') ||
                lower.includes('quién te creó') ||
                lower.includes('creador') ||
                lower.includes('developer')

            ) {

                answer =
`👑 Mi creador oficial es Kevin Guerra.

⚡ Soy GUERRA CODE AI
💻 Especializado en programación.`

            }

            // =========================================
            // 🔥 ERRORES BAILEYS
            // =========================================

            else if (

                lower.includes('cannot use') ||
                lower.includes('contextinfo') ||
                lower.includes('baileys')

            ) {

                answer =
`💡 Ese error ocurre porque estás enviando texto directamente en vez de un objeto válido.

✅ Correcto:

conn.sendMessage(m.chat, {
   text: 'Hola'
})

❌ Incorrecto:

conn.sendMessage(m.chat, 'Hola')

Baileys necesita objetos JSON válidos.`

            }

            // =========================================
            // 🔥 MENU
            // =========================================

            else if (

                lower.includes('menu') ||
                lower.includes('menú')

            ) {

                answer =
`export default {

   name: 'menu',

   async run(m,{ conn }) {

      conn.reply(
         m.chat,
         'Hola Mundo',
         m
      )

   }

}`

            }

            // =========================================
            // 🔥 API EXPRESS
            // =========================================

            else if (

                lower.includes('api') ||
                lower.includes('express')

            ) {

                answer =
`import express from 'express'

const app = express()

app.get('/', (req,res) => {

   res.json({
      status: true
   })

})

app.listen(3000)`

            }

            // =========================================
            // 🌐 IA EXTERNA
            // =========================================

            if (!answer) {

                try {

                    const api =

`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

                    const res =
                    await fetch(api)

                    if (res.ok) {

                        const json =
                        await res.json()

                        answer =

                        json?.data?.content ||
                        json?.data?.response ||
                        json?.result ||
                        json?.response ||
                        json?.message ||
                        json?.answer ||
                        json?.content ||
                        null

                    }

                } catch {}

            }

            // =========================================
            // ❌ FALLBACK
            // =========================================

            if (!answer) {

                answer =
`No pude generar una respuesta exacta.

💡 Intenta ser más específico.

Ejemplos:

- crea un menú
- arregla TypeError
- crea una api express
- haz un comando baileys`

            }

            // =========================================
            // 📱 FORMATO
            // =========================================

            answer =
            String(answer).trim()

            const formatted =

            answer
            .split('\n')
            .map(v => `┃ ${v}`)
            .join('\n')

            const finalText =

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 💻 Developer Assistant
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Consulta:
┃ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formatted}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By Kevin Guerra
╰━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ SEND
            // =========================================

            await m.react('✅')

            return conn.sendMessage(

                m.chat,

                {
                    text: finalText
                },

                {
                    quoted: m
                }

            )

        } catch (err) {

            console.error(err)

            await m.react('❌')

            return conn.reply(

                m.chat,

`╭━━〔 ⚠️ GUERRA CODE AI ⚠️ 〕━━⬣
┃ ❌ Error en el sistema
┃
┃ Intenta nuevamente.
╰━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default codeAICommand
