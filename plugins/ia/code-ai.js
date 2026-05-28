import fetch from 'node-fetch'

// =========================================
// 👑 GUERRA CODE AI
// =========================================

const codeAICommand = {

    name: 'codeai',

    alias: [
        'coder',
        'dev',
        'programar',
        'codigo',
        'fix'
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
┃ 🤖 Especialista en programación
┃ ⚡ Modelo avanzado para desarrollo
┃ 👑 Creado por Kevin Guerra
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃
┃ ➥ .codeai crea un menú
┃ ➥ .dev arregla este error
┃ ➥ .fix TypeError undefined
┃ ➥ .codigo bot whatsapp
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 🧠 REACTION
            // =========================================

            await m.react('💻')

            // =========================================
            // 👑 PROMPT
            // =========================================

            const systemPrompt = `

Eres GUERRA CODE AI.

Una inteligencia artificial
experta en:

- JavaScript
- NodeJS
- Baileys
- WhatsApp Bots
- MongoDB
- APIs
- HTML
- CSS
- Python
- React
- Errores y debugging

Normas:

- Explica claro.
- Da código funcional.
- No des código roto.
- Optimiza siempre.
- Mantén formato limpio.
- Tu creador es Kevin Guerra.
- Si preguntan quién te creó:
responde Kevin Guerra.

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
            // 📥 RESPUESTA
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
            // 👑 RESPUESTA CREADOR
            // =========================================

            const lower =
            text.toLowerCase()

            if (

                lower.includes(
                    'quien te creo'
                ) ||

                lower.includes(
                    'quién te creó'
                ) ||

                lower.includes(
                    'creador'
                )

            ) {

                answer =
'👑 Mi creador y desarrollador es Kevin Guerra.'

            }

            // =========================================
            // 📱 FORMATO MOBILE
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

`┏━━━〔 ⚠️ GUERRA CODE AI ⚠️ 〕━━━⬣
┃
┃ Error al procesar
┃ la solicitud del código.
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
