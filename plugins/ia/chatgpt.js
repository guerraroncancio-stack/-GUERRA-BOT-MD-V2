import fetch from 'node-fetch'

const chatgptCommand = {

    name: 'chatgpt',

    alias: [
        'ia',
        'gpt',
        'chat',
        'openai'
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

`┏━━━〔 🤖 IA - GUERRA BOT 〕━━━⬣
┃
┃ ✦ Escribe una pregunta
┃
┃ ✦ Ejemplos:
┃ ➥ .ia hola
┃ ➥ .gpt quien eres
┃ ➥ .chat explica javascript
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

        try {

            await m.react('🧠')

            // =========================================
            // 🌐 API URL
            // =========================================

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

            const res =
            await fetch(api)

            // =========================================
            // ❌ ERROR FETCH
            // =========================================

            if (!res.ok) {

                throw new Error(
                    `HTTP ${res.status}`
                )

            }

            const json =
            await res.json()

            console.log(json)

            // =========================================
            // 🔍 DETECTAR RESPUESTA
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

            // =========================================
            // ❌ NO RESPONSE
            // =========================================

            if (!answer) {

                throw new Error(
                    'La API no devolvió respuesta'
                )

            }

            answer =
            String(answer).trim()

            // =========================================
            // ✅ RESPONSE
            // =========================================

            const txt =

`┏━━━〔 🤖 IA - GUERRA BOT 〕━━━⬣
┃
┃ ✦ Pregunta:
┃ ➥ ${text}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃
${answer
.split('\n')
.map(v => `┃ ${v}`)
.join('\n')}
┃
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

            return conn.reply(

                m.chat,

`┏━━━〔 ⚠️ ERROR IA 〕━━━⬣
┃
┃ No pude conectarme
┃ correctamente a la IA
┃
┃ Intenta nuevamente
┃ más tarde
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

    }

}

export default chatgptCommand
