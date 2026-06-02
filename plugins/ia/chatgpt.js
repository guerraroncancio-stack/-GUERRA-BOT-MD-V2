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
`╭━━〔 👑 GUERRA IA 👑 〕━━⬣
┃
┃ 🤖 Inteligencia Artificial
┃ ⚡ Sistema Online
┃ 👑 Developer: Kevin Guerra
┃
┃ ✦ Ejemplos:
┃ ➥ .ia hola
┃ ➥ .gpt explica nodejs
┃ ➥ .chat crea una historia
┃ ➥ .ia quien eres
┃
╰━━━━━━━━━━━━━━⬣`,
                m
            )
        }

        try {

            m.react('⚡').catch(() => {})

            text = String(text)
                .trim()
                .slice(0, 2000)

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

            if (creatorQuestions.some(v => lowerText.includes(v))) {

                await m.react('👑')

                return conn.sendMessage(
                    m.chat,
                    {
                        text:
`╭━━〔 👑 GUERRA IA 👑 〕━━⬣
┃
┃ Mi creador oficial es:
┃
┃ 👑 Kevin Guerra
┃
┃ Desarrollador principal
┃ de GUERRA BOT MD
┃
╰━━━━━━━━━━━━━━⬣`
                    },
                    { quoted: m }
                )
            }

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

            const controller = new AbortController()

            const timeout = setTimeout(() => {
                controller.abort()
            }, 15000)

            const res = await fetch(api, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'GuerraBot'
                }
            })

            clearTimeout(timeout)

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const json = await res.json()

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

                (typeof json === 'string' ? json : null)

            if (!answer) {
                answer = '⚠️ No se obtuvo una respuesta válida.'
            }

            answer = String(answer)
                .trim()
                .replace(/\n{3,}/g, '\n\n')
                .slice(0, 3500)

            const txt =
`╔══════════════════════╗
║      👑 GUERRA IA 👑
╚══════════════════════╝

👤 Usuario:
➥ ${m.pushName || 'Usuario'}

🧠 Consulta:
➥ ${text}

━━━━━━━━━━━━━━━━━━

${answer}

━━━━━━━━━━━━━━━━━━

🤖 Modelo: ChatGPT AI
⚡ Estado: Online
👑 Developer: Kevin Guerra`

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

            await m.react('❌').catch(() => {})

            return conn.sendMessage(
                m.chat,
                {
                    text:
`╭━━〔 ⚠️ GUERRA IA ⚠️ 〕━━⬣
┃
┃ ❌ Error de conexión
┃ con el servidor IA.
┃
┃ Intenta nuevamente.
┃
╰━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: m
                }
            )
        }
    }
}

export default chatgptCommand
