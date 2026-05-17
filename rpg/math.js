import { jidNormalizedUser } from '@whiskeysockets/baileys';

const ECO_CONFIG = {
    BASE_COL: 1000
};

const formatCol = (num) => {
    return Number(num).toLocaleString('de-DE');
};

const difficulties = {
    'facil': { min: 1, max: 20, ops: ['+', '-'], reward: 500, attempts: 3 },
    'medio': { min: 15, max: 60, ops: ['+', '-', '*'], reward: 1500, attempts: 3 },
    'dificil': { min: 50, max: 200, ops: ['+', '-', '*'], reward: 4000, attempts: 4 },
    'experto': { min: 100, max: 500, ops: ['*', '-'], reward: 10000, attempts: 4 },
    'imposible': { min: 300, max: 1000, ops: ['*'], reward: 35000, attempts: 5 }
};

const getHint = (target, guess, attempt, maxAttempts) => {
    if (attempt === maxAttempts - 1) {
        return `Termina en ${target.toString().slice(-1)}`;
    }
    if (attempt === 1 && maxAttempts > 3) {
        return target % 2 === 0 ? 'Es un valor par' : 'Es un valor impar';
    }
    return guess < target ? 'El valor es mayor' : 'El valor es menor';
};

const mathGame = {
    name: 'math',
    alias: ['mate', 'calculo'],
    category: 'game',
    /* owner: true, */
    
    async before(m, { conn }) {
        const txt = (m.text || "").trim().toLowerCase();
        if (!txt || m.isBaileys || m.fromMe) return false;

        global.mathGames = global.mathGames || {};
        const gameId = `${m.chat}-${m.sender}`;
        const game = global.mathGames[gameId];

        if (!game || !txt.includes('resp')) return false;

        const args = txt.split(' ');
        const userAns = parseInt(args[1]);

        if (isNaN(userAns)) return false;

        if (userAns === game.result) {
            const penalty = game.currentAttempt * 0.15;
            const finalReward = Math.floor(game.reward * (1 - penalty));
            
            let user = await global.User.findOne({ id: m.sender });
            if (!user) user = await global.User.create({ id: m.sender, col: ECO_CONFIG.BASE_COL });

            let newCol = (user.col || ECO_CONFIG.BASE_COL) + finalReward;
            await global.User.updateOne({ id: m.sender }, { $set: { col: newCol } });

            await conn.sendMessage(m.chat, {
                text: `┌── [ RESPUESTA EXACTA ] ──\n│ Solucion: ${game.result}\n│ Intentos usados: ${game.currentAttempt + 1}/${game.attempts}\n│ \n│ Ingreso: +${formatCol(finalReward)} Col\n│ Balance total: ${formatCol(newCol)} Col\n└─────────────`
            }, { quoted: m });

            delete global.mathGames[gameId];
            return true;
        } else {
            game.currentAttempt++;
            
            if (game.currentAttempt >= game.attempts) {
                await conn.sendMessage(m.chat, {
                    text: `┌── [ SISTEMA CERRADO ] ──\n│ Intentos agotados.\n│ La solucion era: ${game.result}\n└─────────────`
                }, { quoted: m });
                delete global.mathGames[gameId];
                return true;
            }

            const hint = getHint(game.result, userAns, game.currentAttempt, game.attempts);
            
            await conn.sendMessage(m.chat, {
                text: `┌── [ INTENTO FALLIDO ] ──\n│ Analisis: ${hint}\n│ Oportunidades restantes: ${game.attempts - game.currentAttempt}\n└─────────────`
            }, { quoted: m });
            return true; 
        }
    },
    
    run: async (m, { conn, args, usedPrefix, prefix }) => {
        global.mathGames = global.mathGames || {};
        const gameId = `${m.chat}-${m.sender}`;
        const p = usedPrefix || prefix || '/';

        if (global.mathGames[gameId]) {
            return conn.sendMessage(m.chat, { 
                text: `┌── [ ACCESO DENEGADO ] ──\n│ Tienes un calculo en curso.\n│ Resuelvelo o agota tus intentos.\n└─────────────`
            }, { quoted: m });
        }

        const diffInput = (args[0] || '').toLowerCase();
        
        if (!difficulties[diffInput]) {
            const validDiffs = Object.keys(difficulties).join('\n│ > ');
            return conn.sendMessage(m.chat, {
                text: `┌── [ PARAMETRO INVALIDO ] ──\n│ Define una dificultad:\n│ \n│ > ${validDiffs}\n│ \n│ Uso: ${p}math facil\n└─────────────`
            }, { quoted: m });
        }

        const diff = difficulties[diffInput];
        let op = diff.ops[Math.floor(Math.random() * diff.ops.length)];
        
        let num1 = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;
        let num2 = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;

        if (op === '-' && num1 < num2) {
            let temp = num1; num1 = num2; num2 = temp;
        }

        if (op === '*' && diffInput !== 'imposible' && diffInput !== 'experto') {
            num2 = Math.floor(Math.random() * 12) + 2; 
        }

        const equation = `${num1} ${op} ${num2}`;
        const result = eval(equation); 

        global.mathGames[gameId] = {
            equation,
            result,
            reward: diff.reward,
            attempts: diff.attempts,
            currentAttempt: 0
        };

        return conn.sendMessage(m.chat, {
            text: `┌── [ RETO LOGICO ] ──\n│ Nivel: ${diffInput.toUpperCase()}\n│ \n│ Calcula: ${equation}\n│ \n│ Recompensa: ${formatCol(diff.reward)} Col\n│ Intentos maximos: ${diff.attempts}\n│ \n│ Respuesta: ${p}resp <numero>\n└─────────────`
        }, { quoted: m });
    }
};

export default mathGame;
