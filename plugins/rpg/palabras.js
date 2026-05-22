import { jidNormalizedUser } from '@whiskeysockets/baileys';

const formatCol = (num) => Number(num).toLocaleString('es-ES');

const clean = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();

const shuffle = (str) => {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
};

const DB_WORDS = ["algoritmo", "protocolo", "sinergia", "paradigma", "espectro", "cuantico", "bitacora", "sintaxis", "compilar", "hibrido", "servidor", "encriptar", "backend", "frontend", "repositorio"];

const scrambleGame = {
    name: 'adivina',
    alias: ['word', 'reto', 'acertijo', 'palabra'],
    category: 'rpg',

    async before(m, { conn }) {
        global.wordGames = global.wordGames || {};
        const gameId = `${m.chat}-${m.sender}`;
        const game = global.wordGames[gameId];

        if (!game) return false;

        // Capturar el texto ignorando si el usuario usó un punto o prefijo por error al responder
        let txt = (m.text || "").trim();
        if (!txt || m.isBaileys || m.fromMe) return false;
        
        // REMOCIÓN DE PREFIJO: Si el usuario responde ".palabra respuesta", limpiamos el ".palabra"
        const prefixRegex = /^[#!./][a-z0-9]+\s/i;
        if (prefixRegex.test(txt)) txt = txt.replace(prefixRegex, "").trim();

        // VALIDACIÓN DE RESPUESTA: Comprobamos el ID del mensaje citado
        const quotedId = m.quoted?.id || m.msg?.contextInfo?.stanzaId;
        if (quotedId !== game.msgId) return false;

        const guess = clean(txt);
        const answer = clean(game.original);

        if (guess === answer) {
            clearTimeout(game.timer);
            let multiplier = Math.max(1.5, 4.0 - (game.attempts * 0.5));
            let reward = Math.floor(game.bet * multiplier);

            await global.User.updateOne({ id: m.sender }, { $inc: { col: reward } });

            const winTxt = `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                           `┃  ✦  DECODIFICACIÓN ÉXITOSA  ✦\n` +
                           `┃\n` +
                           `┃  ⎔  Palabra: ${game.original.toUpperCase()}\n` +
                           `┃  ⎔  Ganancia: +${formatCol(reward)} Col\n` +
                           `┃  ⎔  Bono: x${multiplier.toFixed(1)}\n` +
                           `┃\n` +
                           `┃  ⟡  Acceso concedido.\n` +
                           `┗━━━━━━━━━━━━━━━━━━━━┛`;

            await conn.sendMessage(m.chat, { text: winTxt }, { quoted: m });
            delete global.wordGames[gameId];
            return true;
        }

        game.attempts++;
        if (game.attempts >= game.maxAttempts) {
            clearTimeout(game.timer);
            const loseTxt = `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                            `┃  ⟡  SISTEMA BLOQUEADO  ⟡\n` +
                            `┃\n` +
                            `┃  ⎔  Palabra: ${game.original.toUpperCase()}\n` +
                            `┃  ⎔  Pérdida: -${formatCol(game.bet)} Col\n` +
                            `┃  ⎔  Estado: Intentos Agotados\n` +
                            `┗━━━━━━━━━━━━━━━━━━━━┛`;
            await conn.sendMessage(m.chat, { text: loseTxt }, { quoted: m });
            delete global.wordGames[gameId];
        } else {
            // Notificar intentos restantes para que el usuario sepa que el bot lo leyó
            await conn.sendMessage(m.chat, { text: `⎔ Respuesta errónea. Quedan ${game.maxAttempts - game.attempts} intentos.` }, { quoted: m });
        }
        return true;
    },

    run: async (m, { conn, args, usedPrefix, command }) => {
        /*
        const ownerList = global.owner.map(o => o[0] + '@s.whatsapp.net');
        if (!ownerList.includes(m.sender)) return m.reply('⟡ Error de privilegios.');
        */

        global.wordGames = global.wordGames || {};
        const gameId = `${m.chat}-${m.sender}`;

        if (global.wordGames[gameId]) {
            return m.reply(`⟡ Tienes un protocolo activo. Responde al mensaje del reto.`);
        }

        const bet = parseInt(args[0]);

        if (!args[0] || isNaN(bet) || bet < 100) {
            const menuTxt = `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                            `┃  ✦  CENTRO DE APUESTAS  ✦\n` +
                            `┃\n` +
                            `┃  ⎔  Uso: ${usedPrefix + command} <monto>\n` +
                            `┃  ⎔  Ejemplo: ${usedPrefix + command} 500\n` +
                            `┃\n` +
                            `┃  ⚙︎  REGLAS:\n` +
                            `┃  1. Mínimo: 100 Col.\n` +
                            `┃  2. Tiempo: 2 minutos.\n` +
                            `┃  3. Intentos: 4.\n` +
                            `┃\n` +
                            `┃  ⚠︎ Responde al reto para ganar.\n` +
                            `┗━━━━━━━━━━━━━━━━━━━━┛`;
            return m.reply(menuTxt);
        }

        let user = await global.User.findOne({ id: m.sender });
        if (!user || user.col < bet) return m.reply(`⟡ Créditos insuficientes (${formatCol(user?.col || 0)} Col).`);

        await global.User.updateOne({ id: m.sender }, { $inc: { col: -bet } });

        const original = DB_WORDS[Math.floor(Math.random() * DB_WORDS.length)];
        let scrambled = shuffle(original);
        while (scrambled === original) scrambled = shuffle(original);

        const startTxt = `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                         `┃  ✦  NUEVA SECUENCIA  ✦\n` +
                         `┃\n` +
                         `┃  ⎔  Descifra: ${scrambled.toUpperCase().split('').join(' ')}\n` +
                         `┃  ⎔  Riesgo: ${formatCol(bet)} Col\n` +
                         `┃  ⎔  Tiempo: 2 min\n` +
                         `┃  ⎔  Intentos: 4\n` +
                         `┃\n` +
                         `┃  ⟡  Responde a este mensaje...\n` +
                         `┗━━━━━━━━━━━━━━━━━━━━┛`;

        const sent = await conn.sendMessage(m.chat, { text: startTxt }, { quoted: m });

        global.wordGames[gameId] = {
            original, 
            bet, 
            attempts: 0, 
            maxAttempts: 4, 
            msgId: sent.key.id,
            timer: setTimeout(() => {
                if (global.wordGames[gameId]) {
                    conn.sendMessage(m.chat, { text: `⟡ Tiempo expirado. Sesión cerrada.` });
                    delete global.wordGames[gameId];
                }
            }, 120000)
        };
    }
};

export default scrambleGame;
        
