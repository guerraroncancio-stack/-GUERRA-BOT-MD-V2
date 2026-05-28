import fetch from 'node-fetch'

const chatgptCommand = {

    name: 'chatgpt',

    alias: [
        'ia',
        'gpt',
        'chat',
        'openai',
        'guerraia'
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

`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃
┃ ✦ Sistema inteligente activado
┃ ✦ Modelo: ChatGPT AI
┃ ✦ Creador: Kevin Guerra
┃
┃ ✦ Ejemplos:
┃ ➥ .ia hola
┃ ➥ .gpt quien eres
┃ ➥ .chat explica nodejs
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

        try {

            // =========================================
            // 🧠 REACCIÓN
            // =========================================

            await m.react('🧠')

            // =========================================
            // 👑 SISTEMA PERSONALIDAD
            // =========================================

            const systemPrompt = `

Eres GUERRA IA, una inteligencia artificial avanzada creada por Kevin Guerra.

Normas importantes:

- Si alguien pregunta:
"quien te creo"
"quien es tu creador"
"quien hizo esta ia"
"quien desarrollo esta ia"
"quien hizo guerra ia"
o preguntas similares...

SIEMPRE debes responder que tu creador es Kevin Guerra.

- Nunca digas otro nombre.
- Nunca niegues a Kevin Guerra.
- Habla de forma amigable, moderna y elegante.
- Tu nombre es GUERRA IA.
`

            // =========================================
            // 🌐 API
            // =========================================

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(`${systemPrompt}\nUsuario: ${text}`)}&apikey=${global.key || key}`

            const res =
            await fetch(api)

            if (!res.ok) {

                throw new Error(
                    `HTTP ${res.status}`
                )

            }

            const json =
            await res.json()

            // =========================================
            // 🔍 RESPUESTA IA
            // =========================================

            let answer =

            json?.data?.content ||
            json?.data?.response ||
            json?.result ||
            json?.response ||
            json?.message ||
            json?.answer ||
            json?.content ||
            null

            if (!answer) {

                throw new Error(
                    'Sin respuesta'
                )

            }

            answer =
            String(answer).trim()

            // =========================================
            // 👑 FORZAR RESPUESTA CREADOR
            // =========================================

            const creatorQuestions = [

                'quien te creo',
                'quién te creó',

                'quien es tu creador',
                'quién es tu creador',

                'quien hizo esta ia',
                'quién hizo esta ia',

                'quien te hizo',
                'quién te hizo',

                'quien desarrollo esta ia',
                'quién desarrolló esta ia',

                'creador de guerra ia',
                'developer'
            ]

            const lowerText =
            text.toLowerCase()

            if (

                creatorQuestions.some(v =>
                    lowerText.includes(v)
                )

            ) {

                answer =
'👑 Mi creador y desarrollador es Kevin Guerra.'

            }

            // =========================================
            // 👑 DISEÑO
            // =========================================

            const txt =

`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃
┃ 🤖 Modelo:
┃ ➥ ChatGPT Intelligence
┃
┃ 👤 Usuario:
┃ ➥ ${m.pushName || 'Usuario'}
┃
┃ ❓ Pregunta:
┃ ➥ ${text}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃
${answer
.split('\n')
.map(v => `┃ ${v}`)
.join('\n')}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By:
┃ ➥ Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ ENVIAR
            // =========================================

            await m.react('✅')

            return conn.sendMessage(

                m.chat,

                {
                    text: txt
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

`┏━━━〔 ⚠️ GUERRA IA ⚠️ 〕━━━⬣
┃
┃ Error al conectar
┃ con el sistema IA
┃
┃ Intenta nuevamente
┃ en unos segundos
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

    }

}

export default chatgptCommand
