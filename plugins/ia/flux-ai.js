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
        // ❌ SIN PROMPT
        // =========================================

        if (!text) {

            return conn.reply(

                m.chat,

`┏━━━〔 🎨 GUERRA FLUX IA 🎨 〕━━━⬣
┃
┃ ✦ Generador avanzado IA
┃ ✦ Compatible con anime
┃ ✦ Fotos realistas
┃ ✦ Arte cinematográfico
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃
┃ ➥ .flux chica anime neon
┃ ➥ .flux ferrari rojo lluvia
┃ ➥ .flux gato samurai
┃ ➥ .flux paisaje realista
┃ ➥ .flux mujer cyberpunk
┃ ➥ .flux naruto estilo realista
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 🎨 REACCIÓN
            // =========================================

            await m.react('🎨')

            // =========================================
            // 👑 CREADOR
            // =========================================

            const lower =
            text.toLowerCase()

            const creatorQuestions = [

                'quien te creo',
                'quién te creó',
                'creador',
                'developer',
                'quien hizo esta ia',
                'quién hizo esta ia'
            ]

            if (

                creatorQuestions.some(v =>
                    lower.includes(v)
                )

            ) {

                return conn.reply(

                    m.chat,

`┏━━━〔 👑 GUERRA FLUX IA 👑 〕━━━⬣
┃
┃ 🤖 Sistema FLUX IA
┃ 🎨 Especialista en imágenes
┃
┃ 👑 Creador oficial:
┃ ➥ Kevin Guerra
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                    m

                )

            }

            // =========================================
            // 🧠 MEJORADOR PROMPT
            // =========================================

            let enhancedPrompt = text

            // 🔥 Anime
            if (

                lower.includes('anime') ||
                lower.includes('naruto') ||
                lower.includes('waifu') ||
                lower.includes('manga')

            ) {

                enhancedPrompt =
`${text}, ultra detailed anime, masterpiece, best quality, vibrant colors, cinematic lighting, highly detailed, studio anime style`

            }

            // 🔥 Realista
            else if (

                lower.includes('realista') ||
                lower.includes('persona') ||
                lower.includes('mujer') ||
                lower.includes('hombre') ||
                lower.includes('foto')

            ) {

                enhancedPrompt =
`${text}, photorealistic, ultra realistic, 8k, DSLR, cinematic photo, detailed skin, realistic lighting`

            }

            // 🔥 Autos
            else if (

                lower.includes('ferrari') ||
                lower.includes('lamborghini') ||
                lower.includes('bmw') ||
                lower.includes('carro')

            ) {

                enhancedPrompt =
`${text}, cinematic car photography, ultra detailed, reflections, realistic, luxury car, 8k`

            }

            // 🔥 GENERAL
            else {

                enhancedPrompt =
`${text}, ultra detailed, masterpiece, high quality, cinematic lighting, 8k`

            }

            // =========================================
            // 🌐 GENERADOR
            // =========================================

            const imageUrl =

`https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Date.now()}&model=flux&enhance=true&nologo=true`

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
┃ ⚡ Imagen generada
┃ 🚀 Modelo: FLUX PRO
┃ 🎭 Modo IA inteligente
┃ 👑 Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // 📥 DESCARGAR
            // =========================================

            const response =
            await fetch(imageUrl)

            if (!response.ok) {

                throw new Error(
                    'Error generando imagen'
                )

            }

            const buffer =
            Buffer.from(
                await response.arrayBuffer()
            )

            // =========================================
            // ✅ ENVIAR
            // =========================================

            await conn.sendMessage(

                m.chat,

                {
                    image: buffer,
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
