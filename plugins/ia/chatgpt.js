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

`┏━━━〔 🤖 IA GUERRA BOT 〕━━━⬣
┃
┃ ✦ Escribe una pregunta
┃ ✦ Ejemplo:
┃ ➥ .ia hola
┃ ➥ .gpt quien eres
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m
            )

        }

        try {

            // =========================================
            // ⏳ REACCIÓN
            // =========================================

            await m.react('🧠')

            // =========================================
            // 🌐 API
            // =========================================

            const api =
`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

            const response =
            await fetch(api)

            const json =
            await response.json()

            // =========================================
            // ❌ ERROR API
            // =========================================

            if (
                !json ||
                !json.success ||
                !json.data ||
                !json.data.content
            ) {

                throw new Error(
                    'API inválida'
                )

            }

            // =========================================
            // ✅ RESPUESTA IA
            // =========================================

            const ai =
            json.data.content
            .trim()

            const result =

`┏━━━〔 🤖 IA - GUERRA BOT 〕━━━⬣
┃
┃ ✦ Pregunta:
┃ ➥ ${text}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃
${ai
.split('\n')
.map(v => `┃ ${v}`)
.join('\n')}
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`

            await m.react('✅')

            // =========================================
            // 📤 ENVIAR
            // =========================================

            await conn.sendMessage(

                m.chat,

                {
                    text: result
                },

                {
                    quoted: m
                }

            )

        } catch (e) {

            console.error(e)

            await m.react('❌')

            return conn.reply(

                m.chat,

`┏━━━〔 ⚠️ ERROR IA 〕━━━⬣
┃
┃ No pude conectar
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
