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
┃ ➥ .chat explica javascript
┃ ➥ .ia crea una historia
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
            // 🧹 LIMPIAR TEXTO
            // =========================================

            text = String(text)
            .trim()
            .slice(0, 4000)

            // =========================================
            // 👑 PERSONALIDAD IA
            // =========================================

            const systemPrompt = `

Eres GUERRA IA.

Una inteligencia artificial moderna,
inteligente y avanzada creada por Kevin Guerra.

Reglas importantes:

- Tu nombre es GUERRA IA.
- Tu creador y desarrollador es Kevin Guerra.
- Si preguntan quién te creó,
siempre responde Kevin Guerra.
- Responde de manera clara,
inteligente y amigable.
- Puedes responder cualquier tema:
programación, historia, matemáticas,
tecnología, juegos, ayuda general,
conversaciones normales y más.
- Nunca respondas vacío.
- Nunca digas que no tienes respuesta
sin intentar ayudar.
`

            // =========================================
            // 🌐 API URL
            // =========================================

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(`${systemPrompt}\n\nUsuario: ${text}`)}&apikey=${global.key || key}`

            // =========================================
            // 🌐 FETCH
            // =========================================

            const res =
            await fetch(api, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })

            if (!res.ok) {

                throw new Error(
                    `HTTP ${res.status}`
                )

            }

            // =========================================
            // 📦 JSON
            // =========================================

            let json = null

            try {

                json = await res.json()

            } catch {

                throw new Error(
                    'La API no devolvió JSON válido'
                )

            }

            console.log(json)

            // =========================================
            // 🔍 DETECTAR RESPUESTA
            // =========================================

            let answer =

            json?.data?.content ||
            json?.data?.response ||
            json?.data?.message ||

            json?.result ||
            json?.response ||
            json?.message ||
            json?.answer ||
            json?.content ||

            json?.data ||

            null

            // =========================================
            // ❌ SIN RESPUESTA
            // =========================================

            if (
                !answer ||
                answer === '[object Object]'
            ) {

                answer =
'⚠️ No pude generar una respuesta válida.'

            }

            // =========================================
            // 🧹 FORMATEAR RESPUESTA
            // =========================================

            answer =
            String(answer)
            .replace(/^\s+|\s+$/g, '')
            .slice(0, 3500)

            // =========================================
            // 👑 RESPUESTA CREADOR
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

                'developer',
                'creador',
                'owner'
            ]

            const lowerText =
            text.toLowerCase()

            if (

                creatorQuestions.some(v =>
                    lowerText.includes(v)
                )

            ) {

                answer =
'👑 Mi creador y desarrollador oficial es Kevin Guerra.'

            }

            // =========================================
            // 📱 FORMATO MÓVIL
            // =========================================

            const formattedAnswer =

            answer
            .split('\n')
            .filter(v => v.trim())
            .map(v => `┃ ${v}`)
            .join('\n')

            // =========================================
            // 👑 MENSAJE FINAL
            // =========================================

            const txt =

`┏━━━〔 👑 GUERRA IA 👑 〕━━━⬣
┃ 🤖 ChatGPT Intelligence
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ❓ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formattedAnswer}
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
┃ Ocurrió un error al
┃ conectar con la IA.
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

    }

}

export default chatgptCommand
