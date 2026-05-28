import fetch from 'node-fetch'

const fluxCommand = {

    name: 'flux',

    alias: [
        'fluxai',
        'imgai',
        'imagenia',
        'aiimage'
    ],

    category: 'ai',

    cooldown: 10,

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

`┏━━━〔 🎨 GUERRA FLUX IA 🎨 〕━━━⬣
┃
┃ ✦ Generador de imágenes IA
┃ ✦ Modelo: FLUX AI
┃ ✦ Creador: Kevin Guerra
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃
┃ ➥ .flux gato samurai
┃ ➥ .flux ferrari futurista
┃ ➥ .flux anime cyberpunk
┃ ➥ .flux ciudad neon
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 🎨 REACT
            // =========================================

            await m.react('🎨')

            // =========================================
            // 👑 PERSONALIDAD IA
            // =========================================

            const creatorQuestions = [

                'quien te creo',
                'quién te creó',

                'quien hizo esta ia',
                'quién hizo esta ia',

                'quien desarrollo esta ia',
                'quién desarrolló esta ia',

                'creador',
                'developer'

            ]

            const lower =
            text.toLowerCase()

            if (

                creatorQuestions.some(v =>
                    lower.includes(v)
                )

            ) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA FLUX IA 👑 〕━━━⬣
┃
┃ 🤖 Soy GUERRA FLUX IA
┃ 🎨 Especialista en imágenes IA
┃
┃ 👑 Mi creador oficial es:
┃ ➥ Kevin Guerra
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

            // =========================================
            // 🌐 API FLUX
            // =========================================

            const prompt =
            encodeURIComponent(text)

            const imageUrl =

`https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${Date.now()}&model=flux`

            // =========================================
            // 📸 CAPTION
            // =========================================

            const caption =

`┏━━━〔 🎨 GUERRA FLUX IA 🎨 〕━━━⬣
┃
┃ 👤 Usuario:
┃ ➥ ${m.pushName || 'Usuario'}
┃
┃ 🧠 Prompt:
┃ ➥ ${text}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Imagen generada correctamente
┃ 🚀 Modelo: FLUX AI
┃ 👑 Powered By Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // ✅ ENVIAR
            // =========================================

            await conn.sendMessage(

                m.chat,

                {
                    image: {
                        url: imageUrl
                    },
                    caption
                },

                {
                    quoted: m
                }

            )

            await m.react('✅')

        } catch (err) {

            console.error(err)

            await m.react('❌')

            return conn.reply(

                m.chat,

`┏━━━〔 ⚠️ GUERRA FLUX IA ⚠️ 〕━━━⬣
┃
┃ Error al generar
┃ la imagen IA.
┃
┃ Intenta nuevamente.
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

    }

}

export default fluxCommand
