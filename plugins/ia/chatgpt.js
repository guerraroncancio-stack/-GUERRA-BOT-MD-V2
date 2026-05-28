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
┃ ➥ .gpt explica nodejs
┃ ➥ .chat crea una historia
┃ ➥ .ia quien eres
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

            text = String(text || '')
            .trim()
            .slice(0, 3000)

            // =========================================
            // 👑 RESPUESTA CREADOR
            // =========================================

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

            const lowerText =
            text.toLowerCase()

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
┃ 👑 Mi creador y
┃ desarrollador oficial es:
┃
┃ ➥ Kevin Guerra
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`
                    },

                    {
                        quoted: m
                    }

                )

            }

            // =========================================
            // 🌐 API
            // =========================================

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

            // =========================================
            // 📡 FETCH
            // =========================================

            const res =
            await fetch(api)

            // =========================================
            // ❌ ERROR HTTP
            // =========================================

            if (!res.ok) {

                throw new Error(
                    `HTTP ${res.status}`
                )

            }

            // =========================================
            // 📦 JSON
            // =========================================

            const json =
            await res.json()

            console.log(json)

            // =========================================
            // 🔍 RESPUESTA FLEXIBLE
            // =========================================

            let answer = null

            // STRING DIRECTO
            if (
                typeof json === 'string'
            ) {

                answer = json

            }

            // CAMPOS MÁS COMUNES
            else {

                answer =

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

            }

            // =========================================
            // ❌ SIN RESPUESTA
            // =========================================

            if (
                !answer ||
                typeof answer === 'object'
            ) {

                answer =
'⚠️ La IA no pudo generar una respuesta válida.'

            }

            // =========================================
            // 🧹 FORMATEAR
            // =========================================

            answer =
            String(answer)
            .trim()
            .replace(/\n{3,}/g, '\n\n')
            .slice(0, 3500)

            // =========================================
            // 📱 FORMATO MOVIL
            // =========================================

            const formatted =

            answer
            .split('\n')
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
                    text: txt
                },

                {
                    quoted: m
                }

            )

        } catch (err) {

            console.error(err)

            await m.react('❌')

            return conn.sendMessage(

                m.chat,

                {
                    text:
`┏━━━〔 ⚠️ GUERRA IA ⚠️ 〕━━━⬣
┃
┃ Error al conectar
┃ con el servidor IA.
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`
                },

                {
                    quoted: m
                }

            )

        }

    }

}

export default chatgptCommand
