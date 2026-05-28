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

`┏━━━〔 👑 GUERRA CODE AI 👑 〕━━━⬣
┃
┃ 🤖 Asistente avanzado de programación
┃ 💻 Especialista en desarrollo
┃ 👑 Creador: Kevin Guerra
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃
┃ ➥ .dev crea un menú premium
┃ ➥ .fix TypeError baileys
┃ ➥ .codigo api express
┃ ➥ .coder bot whatsapp
┃ ➥ .programar login html
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 💻 REACCIÓN
            // =========================================

            await m.react('💻')

            // =========================================
            // 👑 PREGUNTAS CREADOR
            // =========================================

            const lower =
            text.toLowerCase()

            const creatorQuestions = [

                'quien te creo',
                'quién te creó',

                'quien es tu creador',
                'quién es tu creador',

                'quien hizo esta ia',
                'quién hizo esta ia',

                'quien te hizo',
                'quién te hizo',

                'developer',
                'creador'

            ]

            if (
                creatorQuestions.some(v =>
                    lower.includes(v)
                )
            ) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA CODE AI 👑 〕━━━⬣
┃
┃ 👑 Mi creador oficial es:
┃ ➥ Kevin Guerra
┃
┃ 💻 Sistema:
┃ ➥ GUERRA CODE AI
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

            // =========================================
            // 👑 SYSTEM PROMPT
            // =========================================

            const systemPrompt = `

Eres GUERRA CODE AI.

Especialista en:

- JavaScript
- NodeJS
- Baileys
- APIs
- MongoDB
- HTML
- CSS
- React
- Python
- Bots WhatsApp
- Debugging

Normas:

- Responde claro.
- Da código funcional.
- Corrige errores.
- Optimiza código.
- No uses markdown complejo.
- Habla moderno y limpio.
- Tu creador es Kevin Guerra.

`

            // =========================================
            // 🌐 API
            // =========================================

            const query =
            encodeURIComponent(

`${systemPrompt}

Usuario:
${text}`

            )

            let answer = null

            // =========================================
            // 🔥 API PRINCIPAL
            // =========================================

            try {

                const api =

`${global.url_api}/chat?q=${query}&apikey=${global.key || key}`

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

            } catch (e) {

                console.log(
                    '[ API 1 ERROR ]',
                    e.message
                )

            }

            // =========================================
            // 🔥 FALLBACK API
            // =========================================

            if (!answer) {

                try {

                    const backup =

`https://api.siputzx.my.id/api/ai/gpt4?prompt=${query}`

                    const res2 =
                    await fetch(backup)

                    if (res2.ok) {

                        const json2 =
                        await res2.json()

                        answer =

                        json2?.data ||
                        json2?.result ||
                        json2?.response ||
                        json2?.answer ||
                        json2?.message ||
                        null

                    }

                } catch (e) {

                    console.log(
                        '[ API 2 ERROR ]',
                        e.message
                    )

                }

            }

            // =========================================
            // 🧠 RESPUESTA LOCAL
            // =========================================

            if (!answer) {

                if (
                    lower.includes('menu')
                ) {

                    answer =

`const menu = \`
╭━━〔 👑 MENU 👑 〕━━⬣
┃ ✦ .play
┃ ✦ .sticker
┃ ✦ .ai
╰━━━━━━━━━━━━⬣
\``

                }

                else if (
                    lower.includes('hola')
                ) {

                    answer =
'Hola, soy GUERRA CODE AI 👑'

                }

                else if (
                    lower.includes('baileys')
                ) {

                    answer =

`Baileys es una librería de NodeJS para crear bots de WhatsApp usando WebSocket.`

                }

                else {

                    answer =

'⚠️ No pude generar una respuesta ahora mismo. Intenta nuevamente.'

                }

            }

            // =========================================
            // 🧹 LIMPIAR RESPUESTA
            // =========================================

            answer =
            String(answer)
            .replace(/\*\*/g, '*')
            .trim()

            // =========================================
            // 📱 FORMATO MÓVIL
            // =========================================

            const formatted =

            answer
            .split('\n')
            .map(v => `┃ ${v}`)
            .join('\n')

            const finalText =

`┏━━━〔 👑 GUERRA CODE AI 👑 〕━━━⬣
┃ 💻 Developer Assistant
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Consulta:
┃ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formatted}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ ENVIAR
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

`┏━━━〔 ⚠️ GUERRA CODE AI ⚠️ 〕━━━⬣
┃
┃ Error al conectar
┃ con el sistema IA.
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default codeAICommand
