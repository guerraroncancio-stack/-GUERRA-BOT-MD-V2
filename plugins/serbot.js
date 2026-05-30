export async function startSubBot(...)

const codeCommand = {
    name: 'code',
    alias: ['serbot', 'jadibot'],
    category: 'subbot',

    run: async (m, { conn, text }) => {
        try {
            let number = text.replace(/\D/g, '')

            if (!number) {
                return m.reply(
`╭─〔 📱 VINCULAR SUBBOT 〕─⬣
│
│ Uso:
│ .code 573001234567
│
╰──────────────⬣`
                )
            }

            await m.reply(
`╭─〔 ⏳ GENERANDO 〕─⬣
│
│ Espere un momento...
│ Generando código de vinculación
│
╰──────────────⬣`
            )

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
                await m.reply(
`╭─〔 🔑 CÓDIGO 〕─⬣
│
│ ${code}
│
╰──────────────⬣`
                )
            }

        } catch (e) {
            console.error(e)

            await m.reply(
`╭─〔 ❌ ERROR 〕─⬣
│
│ No se pudo generar
│ el código.
│
╰──────────────⬣`
            )
        }
    }
}

export default codeCommand
