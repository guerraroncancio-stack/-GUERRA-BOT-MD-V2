import fetch from 'node-fetch'

const clima = {
    name: 'clima',
    alias: ['weather', 'tiempo'],
    category: 'info',

    run: async (m, { conn, text }) => {

        if (!text) {
            return m.reply('🌍 Uso:\n.clima Bogota\n.clima Tokyo\n.clima Madrid')
        }

        try {

            const city = encodeURIComponent(text)

            // =========================
            // 1. GEOCODING GLOBAL
            // =========================
            const geo = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es&format=json`
            )

            const geoData = await geo.json()

            if (!geoData.results?.length) {
                return m.reply('❌ Ciudad no encontrada.')
            }

            const place = geoData.results[0]

            const {
                latitude,
                longitude,
                name,
                country,
                timezone
            } = place

            // =========================
            // 2. CLIMA REAL TIME
            // =========================
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${timezone}`
            )

            const weatherData = await weatherRes.json()
            const w = weatherData.current_weather

            // =========================
            // 3. HORA LOCAL EXACTA
            // =========================
            const localTime = new Date().toLocaleString('es-ES', {
                timeZone: timezone
            })

            // =========================
            // 4. INTERPRETACIÓN
            // =========================
            const mapWeather = (code) => {
                if (code === 0) return '☀️ Despejado'
                if (code <= 3) return '⛅ Parcialmente nublado'
                if (code <= 48) return '🌫️ Niebla'
                if (code <= 67) return '🌧️ Lluvia'
                if (code <= 77) return '❄️ Nieve'
                if (code <= 82) return '🌦️ Chubascos'
                return '🌩️ Tormenta'
            }

            // =========================
            // 5. MENSAJE FINAL
            // =========================
            const msg = `
🌍 *CLIMA GLOBAL EN TIEMPO REAL*

📍 Lugar: ${name}, ${country}
⏰ Hora local: ${localTime}
🌡️ Temperatura: ${w.temperature}°C
💨 Viento: ${w.windspeed} km/h
📊 Estado: ${mapWeather(w.weathercode)}

🛰️ Coordenadas:
Lat: ${latitude}
Lon: ${longitude}
`

            await conn.sendMessage(m.chat, {
                text: msg.trim()
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply('❌ Error obteniendo clima.')
        }
    }
}

export default clima
