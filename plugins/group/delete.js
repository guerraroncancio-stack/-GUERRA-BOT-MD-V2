const deleteCommand = {
    name: 'delete',
    alias: ['del', 'd', 'borrar'],
    category: 'group',
    admin: true,
    group: true,

    run: async (m, { conn, text }) => {
        try {
            const header = `🗑️ *ELIMINADOR DE MENSAJES*`;

            if (m.quoted) {
                const key = m.quoted.key || {
                    remoteJid: m.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id,
                    participant: m.quoted.sender || m.quoted.author
                };

                await conn.sendMessage(m.chat, { delete: key });

                const count = parseInt(text);
                if (!isNaN(count) && count > 1) {
                    const limit = Math.min(count - 1, 20);
                    const messages = conn.store?.messages[m.chat]?.array || [];

                    const userMessages = messages
                        .filter(v => (v.key.participant || v.key.remoteJid) === m.quoted.sender)
                        .slice(-limit);

                    for (const msg of userMessages.reverse()) {
                        await conn.sendMessage(m.chat, { delete: msg.key }).catch(() => null);
                    }
                }

                await m.react('🗑️');
                return conn.reply(m.chat, `${header}\n\n✓ Mensaje eliminado correctamente.`, m);
            }

            const count = parseInt(text);
            if (!isNaN(count) && count > 0) {
                const limit = Math.min(count, 20);
                const messages = conn.store?.messages[m.chat]?.array || [];

                if (!messages?.length) {
                    return conn.reply(m.chat, `${header}\n\n⚠️ No hay mensajes en memoria.`, m);
                }

                const toDelete = messages.slice(-limit);

                for (const msg of toDelete.reverse()) {
                    if (msg.key) {
                        await conn.sendMessage(m.chat, { delete: msg.key }).catch(() => null);
                    }
                }

                await m.react('🗑️');
                return conn.reply(m.chat, `${header}\n\n✓ Se eliminaron ${limit} mensajes.`, m);
            }

            return conn.reply(
                m.chat,
                `${header}\n\n⚠️ Responde a un mensaje o indica cantidad a borrar.`,
                m
            );

        } catch (e) {
            return conn.reply(
                m.chat,
                `❌ *ERROR*\n\nNo se pudo eliminar el mensaje.`,
                m
            );
        }
    }
};

export default deleteCommand;
