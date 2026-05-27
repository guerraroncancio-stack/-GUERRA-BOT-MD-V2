const addCommand = {
    name: 'add',
    alias: ['atd', 'agregar'],
    category: 'admin',
    botAdmin: true,
    grupo: true,

    run: async (m, { conn, text }) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null);
            if (!groupMetadata) return;

            let input = text?.trim() || m.quoted?.sender || '';
            if (!input) return m.reply('❌ Ingresa un número o menciona a alguien.');

            const num = input.replace(/[^0-9]/g, '');
            if (num.length < 7) return m.reply('❌ Número inválido.');

            const jid = `${num}@s.whatsapp.net`;

            const already = groupMetadata.participants.some(p => p.id === jid);
            if (already) return m.reply('⚠️ Este usuario ya está en el grupo.');

            await m.react('⏳');

            const result = await conn.groupParticipantsUpdate(
                m.chat,
                [jid],
                'add'
            ).catch(() => null);

            const status = result?.[0]?.status?.toString();

            // ✔️ ADDED DIRECTLY
            if (status === '200') {
                await m.react('✅');

                return conn.sendMessage(m.chat, {
                    text:
`👤 AGREGADO AL GRUPO

• Usuario: @${num}
• Estado: añadido correctamente
• Acción: invitación directa`,
                    mentions: [jid]
                }, { quoted: m });
            }

            // ⚠️ YA EN GRUPO
            if (status === '409') {
                await m.react('⚠️');
                return m.reply('⚠️ El usuario ya pertenece al grupo.');
            }

            // ❌ NO SE PUDO AGREGAR → INVITACIÓN PRIVADA
            const code = await conn.groupInviteCode(m.chat).catch(() => null);

            if (!code) {
                await m.react('❌');
                return m.reply('❌ No se pudo generar enlace de invitación.');
            }

            const invite =
`👋 INVITACIÓN DE GRUPO

Te han intentado agregar, pero WhatsApp no lo permitió.

🔗 Únete aquí:
https://chat.whatsapp.com/${code}

📌 Si quieres entrar, toca el enlace.`;

            await conn.sendMessage(jid, {
                text: invite
            }).catch(() => null);

            await m.react('📨');

            return conn.sendMessage(m.chat, {
                text:
`📨 INVITACIÓN ENVIADA

• Usuario: @${num}
• Acción: invitación privada enviada`,
                mentions: [jid]
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            await m.react('❌');
            return m.reply('❌ Error inesperado al ejecutar add.');
        }
    }
};

export default addCommand;
