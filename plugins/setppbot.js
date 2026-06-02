const setppbot = {
    name: 'setppbot',
    alias: ['ppbot', 'setbotpp'],
    category: 'owner',

    run: async (m, { conn, isROwner }) => {

        // 🔒 seguridad (opcional)
        if (!isROwner) {
            return m.reply('❌ Solo el owner puede usar este comando.')
        }

        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!mime.includes('image')) {
            return m.reply('⚠️ Responde a una imagen para cambiar la foto del bot.')
        }

        try {

            await m.react('⏳')

            // 📥 descargar imagen
            const media = await q.download?.()

            if (!media) {
                return m.reply('❌ No se pudo descargar la imagen.')
            }

            // 🤖 cambiar foto de perfil
            await conn.updateProfilePicture(conn.user.id, media)

            await m.react('✅')

            return m.reply('✅ Foto del bot actualizada correctamente.')

        } catch (e) {

            console.log(e)
            await m.react('❌')
            return m.reply('❌ Error al cambiar la foto del bot.')
        }
    }
}

export default setppbot
