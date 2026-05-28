import WebSocket from 'ws'
import fetch from 'node-fetch'
import axios from 'axios'

const sessions = new Map()

// =========================================
// 👑 GUERRA IA COPILOT
// =========================================

class Copilot {

    constructor() {

        this.conversationId = null

        this.foundMedia = []

        this.headers = {

            origin:
            'https://copilot.microsoft.com',

            'user-agent':
            'Mozilla/5.0 (Linux; Android 15)',

            'content-type':
            'application/json'

        }

    }

    // =========================================
    // 🌐 CREAR CONVERSACIÓN
    // =========================================

    async createConversation() {

        const res =
        await fetch(

            'https://copilot.microsoft.com/c/api/conversations',

            {
                method: 'POST',
                headers: this.headers
            }

        )

        if (!res.ok) {

            throw new Error(
                `HTTP ${res.status}`
            )

        }

        const data =
        await res.json()

        this.conversationId = data.id

        return this.conversationId

    }

    // =========================================
    // 🧠 CHAT
    // =========================================

    async chat(message, sessionId = 'default') {

        if (!this.conversationId) {

            await this.createConversation()

        }

        if (!sessions.has(sessionId)) {

            sessions.set(sessionId, [])

        }

        const history =
        sessions.get(sessionId)

        return new Promise((resolve, reject) => {

            const ws = new WebSocket(

                'wss://copilot.microsoft.com/c/api/chat?api-version=2&ncedge=1',

                {
                    headers: this.headers
                }

            )

            let responseText = ''

            const timeout =
            setTimeout(() => {

                if (
                    ws.readyState ===
                    WebSocket.OPEN
                ) {

                    ws.close()

                }

                reject(
                    new Error('Timeout')
                )

            }, 50000)

            // =========================================
            // 🔓 OPEN
            // =========================================

            ws.on('open', () => {

                ws.send(JSON.stringify({

                    event: 'setOptions',

                    supportedFeatures: [
                        'partial-generated-images',
                        'generated-images',
                        'visual-search'
                    ],

                    supportedCards: [
                        'image',
                        'main',
                        'video',
                        'search-result'
                    ]

                }))

                // =========================================
                // 👑 PERSONALIDAD
                // =========================================

                const systemInstruction = `

Eres GUERRA IA COPILOT.

Tu creador y desarrollador oficial es Kevin Guerra.

Reglas:

- Si preguntan quién te creó:
responde Kevin Guerra.

- Habla elegante y moderno.

- Responde cualquier tema:
programación, IA, historia,
matemáticas, juegos, ayuda,
tecnología y conversación.

- No uses markdown raro.

- Usa formato limpio para WhatsApp.

`

                const context =
                history
                .map(v =>
`Usuario: ${v.q}
IA: ${v.a}`
                )
                .join('\n')

                const fullPrompt =

`${systemInstruction}

${context}

Usuario: ${message}`

                ws.send(JSON.stringify({

                    event: 'send',

                    mode: 'chat',

                    conversationId:
                    this.conversationId,

                    content: [
                        {
                            type: 'text',
                            text: fullPrompt
                        }
                    ],

                    context: {}

                }))

            })

            // =========================================
            // 📩 MESSAGE
            // =========================================

            ws.on('message', chunk => {

                try {

                    const parsed =
                    JSON.parse(
                        chunk.toString()
                    )

                    // =========================================
                    // 📝 TEXTO
                    // =========================================

                    if (
                        parsed.event ===
                        'appendText'
                    ) {

                        responseText +=
                        parsed.text || ''

                    }

                    // =========================================
                    // 🖼️ MEDIA
                    // =========================================

                    if (
                        parsed.event ===
                        'card'
                    ) {

                        // IMAGES
                        if (

                            parsed.card?.type ===
                            'image'

                        ) {

                            parsed.card.images
                            ?.forEach(img => {

                                if (
                                    img.image?.url
                                ) {

                                    this.foundMedia.push({

                                        type: 'image',

                                        url:
                                        img.image.url

                                    })

                                }

                            })

                        }

                        // VIDEOS
                        if (

                            parsed.card?.type ===
                            'video'

                        ) {

                            parsed.card.videos
                            ?.forEach(vid => {

                                if (
                                    vid.source?.url
                                ) {

                                    this.foundMedia.push({

                                        type: 'video',

                                        url:
                                        vid.source.url

                                    })

                                }

                            })

                        }

                    }

                    // =========================================
                    // 🖼️ URL IMAGE
                    // =========================================

                    if (

                        parsed.event ===
                        'upsertImageUrl'

                    ) {

                        this.foundMedia.push({

                            type: 'image',

                            url: parsed.url

                        })

                    }

                    // =========================================
                    // ✅ DONE
                    // =========================================

                    if (
                        parsed.event ===
                        'done'
                    ) {

                        clearTimeout(timeout)

                        let cleanText =
                        responseText.trim()

                        if (!cleanText) {

                            cleanText =
'⚠️ No se pudo generar una respuesta.'

                        }

                        // =========================================
                        // 👑 RESPUESTA CREADOR
                        // =========================================

                        const lower =
                        message.toLowerCase()

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

                            cleanText =
'👑 Mi creador oficial es Kevin Guerra.'

                        }

                        // =========================================
                        // 💾 HISTORIAL
                        // =========================================

                        history.push({

                            q: message,
                            a: cleanText

                        })

                        if (
                            history.length > 5
                        ) {

                            history.shift()

                        }

                        resolve({

                            text: cleanText,

                            media:
                            this.foundMedia

                        })

                        ws.close()

                    }

                } catch {}

            })

            // =========================================
            // ❌ ERROR
            // =========================================

            ws.on('error', err => {

                clearTimeout(timeout)

                reject(err)

            })

        })

    }

}

// =========================================
// 📥 DOWNLOAD MEDIA
// =========================================

async function downloadMedia(
    url,
    retries = 2
) {

    for (
        let i = 0;
        i < retries;
        i++
    ) {

        try {

            const response =
            await axios.get(url, {

                responseType:
                'arraybuffer',

                timeout: 10000

            })

            return Buffer.from(
                response.data
            )

        } catch {

            if (
                i === retries - 1
            ) {

                return null

            }

        }

    }

}

// =========================================
// 🖼️ SEND ALBUM
// =========================================

async function sendAlbum(
    conn,
    jid,
    mediaList,
    options = {}
) {

    for (
        let i = 0;
        i < mediaList.length;
        i++
    ) {

        const item =
        mediaList[i]

        const buffer =
        await downloadMedia(
            item.url
        )

        if (!buffer) continue

        if (
            item.type === 'video'
        ) {

            await conn.sendMessage(

                jid,

                {

                    video: buffer,

                    caption:
                    i === 0
                    ? options.caption
                    : ''

                },

                {
                    quoted:
                    options.quoted
                }

            )

        } else {

            await conn.sendMessage(

                jid,

                {

                    image: buffer,

                    caption:
                    i === 0
                    ? options.caption
                    : ''

                },

                {
                    quoted:
                    options.quoted
                }

            )

        }

    }

}

// =========================================
// 👑 COMANDO
// =========================================

const copilotCommand = {

    name: 'copilot',

    alias: [
        'copilot',
        'ms',
        'bing'
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

`┏━━━〔 👑 GUERRA COPILOT 👑 〕━━━⬣
┃
┃ ✦ IA Microsoft activada
┃ ✦ Modelo: Copilot AI
┃ ✦ Creador: Kevin Guerra
┃
┃ ✦ Ejemplos:
┃ ➥ .copilot hola
┃ ➥ .ms explica javascript
┃ ➥ .bing crea una historia
┃
┗━━━━━━━━━━━━━━━━━━━━⬣`,

                m

            )

        }

        try {

            // =========================================
            // 🧠 REACT
            // =========================================

            await m.react('🧠')

            const copilot =
            new Copilot()

            const result =
            await copilot.chat(
                text,
                m.sender
            )

            await m.react('✅')

            // =========================================
            // 📱 FORMATO
            // =========================================

            const formatted =

            result.text
            .split('\n')
            .map(v => `┃ ${v}`)
            .join('\n')

            const finalText =

`┏━━━〔 👑 GUERRA COPILOT 👑 〕━━━⬣
┃ 🤖 Microsoft Copilot
┃ 👤 ${m.pushName || 'Usuario'}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ❓ ${text}
┣━━━━━━━━━━━━━━━━━━⬣
${formatted}
┣━━━━━━━━━━━━━━━━━━⬣
┃ ⚡ Powered By Kevin Guerra
┗━━━━━━━━━━━━━━━━━━━━⬣`

            // =========================================
            // 🖼️ MEDIA
            // =========================================

            if (

                result.media &&
                result.media.length > 0

            ) {

                return await sendAlbum(

                    conn,

                    m.chat,

                    result.media.slice(0, 5),

                    {

                        caption:
                        finalText,

                        quoted: m

                    }

                )

            }

            // =========================================
            // 📩 TEXTO
            // =========================================

            return conn.sendMessage(

                m.chat,

                {
                    text: finalText
                },

                {
                    quoted: m
                }

            )

        } catch (e) {

            console.error(e)

            await m.react('❌')

            return conn.sendMessage(

                m.chat,

                {

                    text:
`┏━━━〔 ⚠️ GUERRA COPILOT ⚠️ 〕━━━⬣
┃
┃ Error al conectar
┃ con Microsoft Copilot.
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

export default copilotCommands
