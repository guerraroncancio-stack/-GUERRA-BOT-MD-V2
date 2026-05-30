import fs from 'fs'
import path from 'path'
import { startSubBot } from '../lib/serbot.js'

const MAX_SUBBOTS = 2

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text, isOwner }) => {

        // ELIMINAR SUBBOT
        if (text?.startsWith('delbot ')) {

            if (!isOwner) {
                return m.reply('❌ Solo el owner puede eliminar subbots.')
            }

            const number = text.replace('delbot', '').replace(/\D/g, '')

            if (!number) {
                return m.reply('Uso:\n.code delbot 573001234567')
            }

            const dbPath = path.join(process.cwd(), 'jadibts', `${number}.sqlite`)

            try {

                const sock = global.conns?.get(number)

                if (sock) {
                    try {
                        sock.ws.close()
                    } catch {}
                    global.conns.delete(number)
                }

                if (fs.existsSync(dbPath)) {
                    fs.unlinkSync(dbPath)
                }

                return m.reply(
`╭─〔 🗑️ SUBBOT ELIMINADO 〕─⬣
│
│ Número:
│ ${number}
│
╰──────────────⬣`
                )

            } catch (e) {
                console.error(e)
                return m.reply('❌ No pude eliminar esa sesión.')
            }
        }

        try {

            let number = text.replace(/\D/g, '')

            if (!number) {
                return conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: 'https://files.catbox.moe/4w0j2v.jpg'
                        },
                        caption:
`╭─〔 📱 VINCULAR SUBBOT 〕─⬣
│
│ Uso:
│ .code 573001234567
│
│ Máximo:
│ ${MAX_SUBBOTS} vinculaciones
│
╰──────────────⬣`
                    },
                    { quoted: m }
                )
            }

            const totalBots = fs.existsSync('./jadibts')
                ? fs.readdirSync('./jadibts')
                    .filter(file => file.endsWith('.sqlite'))
                    .length
                : 0

            if (totalBots >= MAX_SUBBOTS) {
                return m.reply(
`❌ Límite alcanzado.

Solo se permiten ${MAX_SUBBOTS} subbots activos.

Usa:
.code delbot numero

Para liberar espacio.`
                )
            }

            await m.reply('⏳ Generando código...')

            const code = await startSubBot(
                m,
                conn,
                number,
                {
                    isCode: true,
                    caption: '🔑 Código generado'
                }
            )

            if (code) {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: 'https://files.catbox.moe/4w0j2v.jpg'
                        },
                        caption:
`╭─〔 🔑 CÓDIGO DE VINCULACIÓN 〕─⬣
│
│ ${code}
│
╰──────────────⬣`
                    },
                    { quoted: m }
                )
            }

        } catch (e) {
            console.error(e)
            await m.reply('❌ Error al generar el código.')
        }
    }
}

export default codeCommand
