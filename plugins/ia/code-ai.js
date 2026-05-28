import fetch from 'node-fetch'

// =========================================
// 👑 GUERRA CODE AI
// =========================================

const codeAICommand = {

```
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
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 💻 Asistente de programación
┃ ⚡ Especialista en desarrollo
┃ 👑 Creador: Kevin Guerra
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Ejemplos:
┃ ➥ .dev crea un menú
┃ ➥ .fix error baileys
┃ ➥ .codigo bot whatsapp
┃ ➥ .coder api nodejs
╰━━━━━━━━━━━━━━━━━━⬣`,

```
            m

        )

    }

    try {

        // =========================================
        // 💻 REACT
        // =========================================

        await m.react('💻')

        // =========================================
        // 👑 RESPUESTAS MANUALES
        // =========================================

        const lower = text.toLowerCase()

        // =========================================
        // 👑 CREADOR
        // =========================================

        if (

            lower.includes('quien te creo') ||
            lower.includes('quién te creó') ||
            lower.includes('creador') ||
            lower.includes('developer')

        ) {

            await m.react('✅')

            return conn.reply(

                m.chat,
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 🤖 Sistema Developer AI
┃
┃ 👑 Mi creador oficial es:
┃ ➥ Kevin Guerra
┃
┃ ⚡ Inteligencia avanzada
┃ ⚡ Optimizada para código
╰━━━━━━━━━━━━━━━━━━⬣`,

```
                m

            )

        }

        // =========================================
        // 🔥 FIX BAILEYS
        // =========================================

        if (

            lower.includes('baileys') ||
            lower.includes('error') ||
            lower.includes('cannot use in operator')

        ) {

            await m.react('✅')

            return conn.reply(

                m.chat,
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 🔥 Solución encontrada
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Error detectado:
┃ Cannot use 'in' operator
┃
┃ ✅ Solución:
┃
┃ Usa:
┃
┃ const msg = {
┃   text: 'Hola'
┃ }
┃
┃ Y NO:
┃
┃ const msg = '.hola'
┃
┃ Baileys necesita objetos
┃ válidos dentro de sendMessage
┃ y generateWAMessage.
╰━━━━━━━━━━━━━━━━━━⬣`,

```
                m

            )

        }

        // =========================================
        // 🔥 MENU BOT
        // =========================================

        if (

            lower.includes('menu') ||
            lower.includes('menú')

        ) {

            await m.react('✅')

            return conn.reply(

                m.chat,
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 💻 Código generado
┣━━━━━━━━━━━━━━━━━━⬣
┃ export default {
┃   name: 'menu',
┃
┃   async run(m,{conn}) {
┃
┃     conn.reply(
┃       m.chat,
┃       'Hola Mundo',
┃       m
┃     )
┃
┃   }
┃ }
╰━━━━━━━━━━━━━━━━━━⬣`,

```
                m

            )

        }

        // =========================================
        // 🔥 API NODEJS
        // =========================================

        if (

            lower.includes('api') ||
            lower.includes('nodejs')

        ) {

            await m.react('✅')

            return conn.reply(

                m.chat,
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ ⚡ API NodeJS
┣━━━━━━━━━━━━━━━━━━⬣
┃ import express
┃ from 'express'
┃
┃ const app = express()
┃
┃ app.get('/', (req,res)=>{
┃   res.json({
┃     status: true
┃   })
┃ })
┃
┃ app.listen(3000)
╰━━━━━━━━━━━━━━━━━━⬣`,

```
                m

            )

        }

        // =========================================
        // 🌐 IA REAL
        // =========================================

        let answer = null

        try {

            const api =
```

`${global.url_api}/chat?q=${encodeURIComponent(text)}&apikey=${global.key || key}`

```
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
        // 🔥 FALLBACK INTELIGENTE
        // =========================================

        if (!answer) {

            answer =
```

`No pude generar código exacto para esa consulta.

Intenta especificar:

* lenguaje
* error
* framework
* librería

Ejemplo:
"crea un menú en baileys"
"arregla TypeError en nodejs"
"haz una api express"`

```
        }

        answer =
        String(answer).trim()

        // =========================================
        // 📱 FORMATO
        // =========================================

        const formatted =

        answer
        .split('\n')
        .map(v => `┃ ${v}`)
        .join('\n')

        const finalText =
```

`╭━━〔 👑 GUERRA CODE AI 👑 〕━━⬣
┃ 💻 Developer Assistant
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ 📌 Consulta:
┃ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formatted}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By Kevin Guerra
╰━━━━━━━━━━━━━━━━━━⬣`

```
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
```

`╭━━〔 ⚠️ GUERRA CODE AI ⚠️ 〕━━⬣
┃ ❌ Error en el sistema
┃
┃ Intenta nuevamente
┃ en unos segundos.
╰━━━━━━━━━━━━━━━━━━⬣`,

```
            m

        )

    }

}
```

}

export default codeAICommand
