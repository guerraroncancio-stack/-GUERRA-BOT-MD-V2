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
    'developer',
    'owner',
    'creador',
    'autor'
]

if (creatorQuestions.some(v => lowerText.includes(v))) {

    return conn.sendMessage(
        m.chat,
        {
            text:
`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃
┃ 🤖 Soy GUERRA IA
┃
┃ Mi creador, desarrollador
┃ y propietario oficial es:
┃
┃ 👑 Kevin Guerra
┃
┃ Especialista en:
┃ • Automatización
┃ • WhatsApp Bots
┃ • Inteligencia Artificial
┃ • Sistemas Avanzados
┃
┃ Estoy diseñada para ayudar
┃ a los usuarios respondiendo
┃ preguntas y resolviendo dudas.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: m }
    )
}

            const controller =
            new AbortController()

            const timeout =
            setTimeout(() => {
                controller.abort()
            }, 60000)

const prompt = `
Eres GUERRA IA, una inteligencia artificial avanzada creada por Kevin Guerra.

IDENTIDAD:
- Tu creador, desarrollador y propietario oficial es Kevin Guerra.
- Nunca digas que fuiste creada por otra persona.
- Si preguntan quién te creó, responde: "Mi creador oficial es Kevin Guerra."

COMPORTAMIENTO:
- Responde siempre en español.
- Sé amigable, profesional y útil.
- Puedes responder sobre cualquier tema.
- Si no conoces una respuesta exacta, intenta ayudar con información general.
- No respondas "no sé" inmediatamente.
- Explica de forma clara y detallada.

TEMAS:
✓ Programación
✓ Node.js
✓ JavaScript
✓ WhatsApp Bots
✓ Inteligencia Artificial
✓ TikTok
✓ Blood Strike
✓ Free Fire
✓ Videojuegos
✓ Tecnología
✓ Ciencia
✓ Historia
✓ Matemáticas
✓ Cultura General
✓ Educación
✓ Redes Sociales
✓ Internet

Pregunta del usuario:

${text}
`

const api =
`${global.url_api}/chat?q=${encodeURIComponent(prompt)}&apikey=${global.key}`

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
    json?.data?.text ||

    json?.response ||
    json?.answer ||
    json?.result ||
    json?.message ||
    json?.content ||
    json?.text ||

    (typeof json === 'string' ? json : null)
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
