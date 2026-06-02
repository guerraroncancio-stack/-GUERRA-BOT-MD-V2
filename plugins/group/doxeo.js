const doxear = {
    name: 'doxeo',
    alias: ['dox', 'fakeinfo'],
    category: 'fun',
    group: true,

    run: async (m, { conn }) => {
        let user =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            m.sender

        const nombres = [
            'Carlos Pérez',
            'Juan Gómez',
            'Andrés López',
            'Kevin Ramírez',
            'David Torres'
        ]

        const ciudades = [
            'Bogotá',
            'Medellín',
            'Cali',
            'Barranquilla',
            'Cartagena'
        ]

        const ips = [
            '192.168.1.55',
            '10.0.0.74',
            '172.16.0.33',
            '201.54.78.102'
        ]

        const nombre = nombres[Math.floor(Math.random() * nombres.length)]
        const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)]
        const ip = ips[Math.floor(Math.random() * ips.length)]

        const edad = Math.floor(Math.random() * 20) + 18
        const dinero = Math.floor(Math.random() * 5000000)

        const texto = `
╭━━〔 ☠️ DOXEO FAKE ☠️ 〕━━⬣
┃
┃ 👤 Objetivo:
┃ @${user.split('@')[0]}
┃
┃ 📛 Nombre:
┃ ${nombre}
┃
┃ 🎂 Edad:
┃ ${edad} años
┃
┃ 🌎 Ciudad:
┃ ${ciudad}
┃
┃ 📡 IP:
┃ ${ip}
┃
┃ 💰 Saldo:
┃ $${dinero.toLocaleString()}
┃
┃ ⚠️ INFORMACIÓN FICTICIA
┃ ⚠️ SOLO ENTRETENIMIENTO
┃
╰━━━━━━━━━━━━━━⬣
`

        await conn.sendMessage(
            m.chat,
            {
                text: texto,
                mentions: [user]
            },
            { quoted: m }
        )
    }
}

export default doxear
