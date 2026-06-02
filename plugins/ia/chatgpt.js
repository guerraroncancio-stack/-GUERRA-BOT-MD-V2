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

    async run(m, { conn, text }) {

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
┃ ➥ .gpt explica nodejs
┃ ➥ .chat crea una historia
┃ ➥ .ia quien eres
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,
                m
            )
        }

        try {

            await m.react('🧠')

            text = String(text || '')
            .trim()
            .slice(0, 3000)

            const lowerText = text.toLowerCase()

            const creatorQuestions = [

                'quien te creo',
                'quién te creó',
                'quien es tu creador',
                'quién es tu creador',
                'quien te hizo',
                'quién te hizo',
                'creador',
                'developer',
                'owner'
            ]

            if (
                creatorQuestions.some(v =>
                    lowerText.includes(v)
                )
            ) {

                await m.react('✅')

                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃
┃ 🤖 Soy GUERRA IA
┃
┃ 👑 Mi creador,
┃ desarrollador y propietario
┃ oficial es:
┃
┃ ➥ Kevin Guerra
┃
┃ ⚡ Sistema desarrollado
┃ para automatización,
┃ inteligencia artificial
┃ y asistencia avanzada.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`
                    },
                    {
                        quoted: m
                    }
                )
            }

            const controller =
            new AbortController()

            const timeout =
            setTimeout(() => {
                controller.abort()
            }, 15000)

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key}`

            const res = await fetch(api, {
                signal: controller.signal
            })

            clearTimeout(timeout)

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const json =
            await res.json()

            let answer =

                json?.data?.content ||
                json?.data?.response ||
                json?.data?.answer ||
                json?.data?.message ||

                json?.response ||
                json?.answer ||
                json?.result ||
                json?.message ||
                json?.content ||

                null

            if (!answer) {

                answer =
'⚠️ La IA no pudo generar una respuesta válida.'

            }

            answer =
            String(answer)
            .trim()
            .replace(/\n{3,}/g, '\n\n')
            .slice(0, 3500)

            const formatted =

            answer
            .split('\n')
            .map(v => `┃ ${v}`)
            .join('\n')

            const txt =

`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃ 🤖 ChatGPT Intelligence
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ❓ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formatted}
┣━━━━━━━━━━━━━━━━━━⬣
┃ 👑 Creador: Kevin Guerra
┃ ⚡ Powered By Guerra Bot
┗━━━━━━━━━━━━━━━━━━━━⬣`

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

            let msgError =

`┏━━━〔 ⚠️ GUERRA IA ⚠️ 〕━━━⬣
┃
┃ No fue posible obtener
┃ una respuesta de la IA.
┃
┃ Motivos posibles:
┃ • API fuera de línea
┃ • Tiempo agotado
┃ • Servidor saturado
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`

            if (
                err.name === 'AbortError'
            ) {

                msgError =

`┏━━━〔 ⚠️ GUERRA IA ⚠️ 〕━━━⬣
┃
┃ La solicitud tardó
┃ demasiado tiempo.
┃
┃ El servidor IA no
┃ respondió antes del
┃ límite establecido.
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`
            }

            return conn.sendMessage(
                m.chat,
                {
                    text: msgError
                },
                {
                    quoted: m
                }
            )
        }
    }
}

export default chatgptCommand
