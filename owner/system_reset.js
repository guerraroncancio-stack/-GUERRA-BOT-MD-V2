import { jidNormalizedUser } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';

export default {
    name: 'reset_total',
    alias: ['limpiar_todo', 'fullreset', 'hardreset'],
    category: 'owner',

    run: async (m, { conn, args, usedPrefix, command }) => {
        const ownerList = global.owner.map(owner => owner[0] + '@s.whatsapp.net');
        const isOwner = [conn.user.jid, ...ownerList].includes(m.sender);

        if (!isOwner) return m.reply('┏━━━━━━━━━━━━━━━━━━━━┓\n┃ ⨯ ACCESO DENEGADO\n┃ Requiere Admin Global\n┗━━━━━━━━━━━━━━━━━━━━┛');

        if (args[0] !== 'confirmar') {
            return m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓\n┃ ⚠︎ ALERTA DE BORRADO TOTAL ⚠︎\n┃\n┃ Esto eliminará:\n┃ 1. TODOS los comandos nuevos.\n┃ 2. Cambios en el Handler/Index.\n┃ 3. Toda la Base de Datos.\n┃ 4. Sesiones y Módulos.\n┃\n┃ Escribe: ${usedPrefix + command} confirmar\n┗━━━━━━━━━━━━━━━━━━━━┛`);
        }

        try {
            await m.reply('⟡ [SISTEMA] Ejecutando purga total... El bot se apagará.');

            if (global.User) await global.User.deleteMany({});

            const shellCmd = 'git fetch --all && git reset --hard origin/main && rm -rf node_modules sessions jadibts sessiom && npm install';

            exec(shellCmd, async (err, stdout, stderr) => {
                if (err) {
                    return console.error(`Error en reset: ${err.message}`);
                }
                process.exit(0);
            });

        } catch (e) {
            console.error(e);
            m.reply("⟡ Error en el protocolo de purga.");
        }
    }
};
                
