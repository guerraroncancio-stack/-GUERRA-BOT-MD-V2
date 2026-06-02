import fetch from 'node-fetch'

const clima = {
    name: 'clima',
    alias: ['weather', 'tiempo'],
    category: 'info',

    run: async (m, { conn, text }) => {

        if (!text) {
            return m.reply('🌤️ Uso:\n.clima Bogota')
        }

        try {

            const ciudad = encodeURIComponent(text)

            // 1. Buscar coordenadas
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${ciudad}&count=1&language=es&format=json`)
            const geoData = await geoRes.json()

            if (!geoData.results || !geoData.results.length) {
                return m.reply('❌ No se encontró la ciudad.')
            }

            const place = geoData.results[0]
            const { latitude, longitude, name, country } = place

            // 2. Clima actual
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&language=es`
            )

            const weatherData = await weatherRes.json()
            const w = weatherData.current_weather

            // 3. Interpretación básica
            const mapWeather = (code) => {
                if (code === 0) return '☀️ Despejado'
                if (code <= 3) return '⛅ Parcialmente nublado'
                if (code <= 48) return '🌫️ Niebla'
                if (code <= 67) return '🌧️ Lluvia'
                if (code <= 77) return '❄️ Nieve'
                if (code <= 82) return '🌧️ Chubascos'
                return '🌩️ Tormenta'
            }

            const msg = `
🌤️ *CLIMA ACTUAL*

📍 Lugar: ${name}, ${country}
🌡️ Temperatura: ${w.temperature}°C
💨 Viento: ${w.windspeed} km/h
📊 Estado: ${mapWeather(w.weathercode)}

⏱️ Hora: ${new Date().toLocaleString()}
`

            await conn.sendMessage(m.chat, {
                text: msg.trim()
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error obteniendo el clima.')
        }
    }
}

export default clima
