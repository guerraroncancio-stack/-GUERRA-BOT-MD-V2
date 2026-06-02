const doxear = {
    name: 'doxeo',
    alias: ['dox', 'fakeinfo'],
    category: 'fun',
    group: true,

    run: async (m, { conn }) => {
        try {

            let user =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                m.sender

            const nombres = [
                'Kevin Ramírez',
                'Juan Gómez',
                'David Torres',
                'Carlos Pérez',
                'Andrés López',
                'Sebastián Díaz'
            ]

            const ciudades = [
                'Bogotá',
                'Medellín',
                'Cali',
                'Barranquilla',
                'Cartagena',
                'Bucaramanga'
            ]

            const sistemas = [
                'Android 15',
                'Android 14',
                'iOS 18',
                'Windows 11',
                'Linux'
            ]

            const operadores = [
                'Claro',
                'Movistar',
                'Tigo',
                'WOM'
            ]

            const nombre = nombres[Math.floor(Math.random() * nombres.length)]
            const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)]
            const sistema = sistemas[Math.floor(Math.random() * sistemas.length)]
            const operador = operadores[Math.floor(Math.random() * operadores.length)]

            const edad = Math.floor(Math.random() * 20) + 18
            const dinero = Math.floor(Math.random() * 10000000)
            const bateria = Math.floor(Math.random() * 100)
            const ping = Math.floor(Math.random() * 80) + 10

            const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`

            await m.reply(`
🟢 Iniciando rastreo...
▰▱▱▱▱▱▱▱▱▱ 10%
`)

            await new Promise(r => setTimeout(r, 1000))

            await m.reply(`
🟢 Localizando objetivo...
▰▰▰▰▱▱▱▱▱▱ 40%
`)

            await new Promise(r => setTimeout(r, 1000))

            await m.reply(`
🟢 Descifrando registros...
▰▰▰▰▰▰▰▱▱▱ 75%
`)

            await new Promise(r => setTimeout(r, 1000))

            const texto = `
╔══════════════════════════════╗
║      🟩 GUERRA BOT OS 🟩      ║
╚══════════════════════════════╝

[████████████████████] 100%

╭─〔 ☠️ INFORME OBTENIDO ☠️ 〕─⬣
│
│ 🎯 OBJETIVO
│ @${user.split('@')[0]}
│
├────────────────⬣
│
│ 👤 Nombre:
│ ${nombre}
│
│ 🎂 Edad:
│ ${edad} años
│
│ 🌎 Ciudad:
│ ${ciudad}
│
│ 📡 IP:
│ ${ip}
│
│ 📱 Sistema:
│ ${sistema}
│
│ 📶 Operador:
│ ${operador}
│
│ 🔋 Batería:
│ ${bateria}%
│
│ ⚡ Ping:
│ ${ping}ms
│
│ 💰 Saldo:
│ $${dinero.toLocaleString()}
│
╰────────────────⬣

🟢 ACCESO CONCEDIDO
🟢 REGISTROS RECUPERADOS
🟢 OPERACIÓN COMPLETADA

> ⚠️ INFORMACIÓN FICTICIA
> ⚠️ COMANDO DE ENTRETENIMIENTO
> ⚠️ NO REPRESENTA DATOS REALES
`

            await conn.sendMessage(
                m.chat,
                {
                    text: texto,
                    mentions: [user]
                },
                { quoted: m }
            )

        } catch (e) {
            console.error(e)
            m.reply('❌ Error al ejecutar el doxeo.')
        }
    }
}

export default doxear
