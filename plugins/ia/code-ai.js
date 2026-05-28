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
┃ 🤖 Asistente de programación
┃ 💻 Especialista en código
┃ 👑 Creador: Kevin Guerra
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃
┃ ➥ .dev crea un menú
┃ ➥ .fix TypeError
┃ ➥ .codigo bot whatsapp
┃ ➥ .coder api nodejs
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 💻 REACT
            // =========================================

            await m.react('💻')

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

Reglas:

- Da código funcional.
- Explica claro.
- No uses markdown raro.
- Optimiza el código.
- Si preguntan quién te creó:
responde Kevin Guerra.

`

            // =========================================
            // 🌐 API URL
            // =========================================

            const query = encodeURIComponent(

`${systemPrompt}

Usuario:
${text}`

            )

            // =========================================
            // 🔥 API PRINCIPAL
            // =========================================

            let answer = null

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

            } catch {}

            // =========================================
            // 🔥 API FALLBACK
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
                        null

                    }

                } catch {}

            }

            // =========================================
            // ❌ SIN RESPUESTA
            // =========================================

            if (!answer) {

                throw new Error(
                    'Sin respuesta'
                )

            }

            answer =
            String(answer).trim()

            // =========================================
            // 👑 FORZAR CREADOR
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
'👑 Mi creador oficial es Kevin Guerra.'

            }

            // =========================================
            // 📱 FORMATO
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
┃ No se pudo conectar
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
