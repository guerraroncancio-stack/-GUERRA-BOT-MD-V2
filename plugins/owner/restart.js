const restartCommand = {
    name: 'restart',
    alias: ['reiniciar', 'reboot'],
    category: 'owner',

    run: async (m, { conn, isROwner }) => {

        if (!isROwner) return;

        const ui = `╭─〔 🔄 *REINICIO DEL SISTEMA* 〕─╮
│
│ ⚙️ Estado: Reiniciando...
│ ⏳ Tiempo estimado: 2s
│ 📡 Proceso: Cerrando sesión
│
╰──────────────────────╯
_El sistema volverá en breve..._`;

        try {
            await m.reply(ui);

            await new Promise(r => setTimeout(r, 2000));

            try {
                if (conn.ws?.readyState === 1) {
                    await conn.logout().catch(() => {});
                }
            } catch {}

            process.exit(0);

        } catch (error) {
            return conn.reply(
                m.chat,
                `❌ *REINICIO FALLIDO*\n\n⚠️ ${error.message}`,
                m
            );
        }
    }
};

export default restartCommand;
