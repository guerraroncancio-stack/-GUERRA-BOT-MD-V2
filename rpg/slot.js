export default {
    name: 'slot',
    alias: ['casino', 'tragaperras', 'slots', 'apostar'],
    category: 'rpg',
    run: async (m, { args, conn, usedPrefix, command }) => {
        try {
            const user = await global.User.findOne({ id: m.sender });
            if (!user) return m.reply('『 ❌ 』 Usuario no encontrado en la base de datos.');

            /*
            const owners = [conn.user.jid, ...global.owner.map(([number]) => number + '@s.whatsapp.net')];
            if (!owners.includes(m.sender)) {
                return m.reply('『 ❌ 』 Solo el desarrollador puede usar este comando.');
            }
            */

            if (!args[0]) {
                const helpMsg = `🎰 *C A S I N O* 🎰\n\n` +
                                `『 📖 』 *CÓMO JUGAR:*\n` +
                                `Ingresa el comando seguido de la cantidad a apostar.\n` +
                                `*Ejemplo:* ${usedPrefix || '#'}${command || 'slot'} 5000\n\n` +
                                `『 🏆 』 *PREMIOS:*\n` +
                                `3 símbolos iguales ➔ Ganas x5\n` +
                                `2 símbolos iguales ➔ Ganas x2\n\n` +
                                `『 ⚠️ 』 *LÍMITES:*\n` +
                                `Apuesta mínima: 💰 1,000\n` +
                                `Apuesta máxima: 💰 100,000,000`;
                return m.reply(helpMsg);
            }

            const currentBalance = user.col || 0;
            let bet = parseInt(args[0]);

            if (isNaN(bet)) return m.reply('『 ⚠️ 』 Por favor ingresa una cantidad válida en números.');
            if (bet < 1000) return m.reply('『 ⚠️ 』 La apuesta mínima es de 💰 1,000.');
            if (bet > 100000000) return m.reply('『 ⚠️ 』 La apuesta máxima permitida es de 💰 100,000,000.');
            if (currentBalance < bet) return m.reply(`『 ❌ 』 Fondos insuficientes. Tu saldo actual es: 💰 ${currentBalance.toLocaleString()}`);

            await global.User.updateOne({ id: m.sender }, { $inc: { col: -bet } });

            const symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '7️⃣', '🔔'];
            const roll = () => symbols[Math.floor(Math.random() * symbols.length)];
            const sleep = (ms) => new Promise(r => setTimeout(r, ms));

            const formatFrame = (a, b, c, infoMsg) => {
                return `🎰 *C A S I N O* 🎰\n\n` +
                       `┏━━━━━━━━━━━━━━━┓\n` +
                       `┃  ${a} ┃ ${b} ┃ ${c}  ┃\n` +
                       `┗━━━━━━━━━━━━━━━┛\n\n` +
                       `🪙 *Apuesta:* 💰 ${bet.toLocaleString()}\n` +
                       `└ ${infoMsg}`;
            };

            const msg = await conn.sendMessage(m.chat, {
                text: formatFrame('❔', '❔', '❔', 'Preparando tambores... 🎲')
            }, { quoted: m });

            const edit = async (a, b, c, textMsg) => {
                await conn.sendMessage(m.chat, {
                    text: formatFrame(a, b, c, textMsg),
                    edit: msg.key
                });
            };

            let a, b, c;
            const spins = 4;

            for (let i = 0; i < spins; i++) {
                await edit(roll(), roll(), roll(), 'Girando suerte... 🔄');
                await sleep(250);
            }

            a = roll();
            for (let i = 0; i < spins - 1; i++) {
                await edit(a, roll(), roll(), 'Deteniendo el primero... 🛑');
                await sleep(350);
            }

            b = roll();
            for (let i = 0; i < spins - 2; i++) {
                await edit(a, b, roll(), 'Casi listo... ⏳');
                await sleep(400);
            }

            c = roll();

            let reward = 0;
            let resultText = '';

            if (a === b && b === c) {
                reward = bet * 5;
                resultText = `🎉 *¡JACKPOT!* Ganaste x5 (💰 +${reward.toLocaleString()})`;
            } else if (a === b || b === c || a === c) {
                reward = bet * 2;
                resultText = `✨ *¡Mini Premio!* Ganaste x2 (💰 +${reward.toLocaleString()})`;
            } else {
                resultText = `💀 Perdiste esta ronda.`;
            }

            if (reward > 0) {
                await global.User.updateOne({ id: m.sender }, { $inc: { col: reward } });
            }

            const finalBalance = currentBalance - bet + reward;

            const finalScreen = `🎰 *C A S I N O* 🎰\n\n` +
                                `┏━━━━━━━━━━━━━━━┓\n` +
                                `┃  ${a} ┃ ${b} ┃ ${c}  ┃\n` +
                                `┗━━━━━━━━━━━━━━━┛\n\n` +
                                `🎯 *Resultado:* ${resultText}\n` +
                                `💳 *Tu Saldo:* 💰 ${finalBalance.toLocaleString()}`;

            await conn.sendMessage(m.chat, {
                text: finalScreen,
                edit: msg.key
            });

        } catch (e) {
            console.error(e);
            m.reply('『 ❌ 』 Ocurrió un error crítico en las máquinas tragamonedas.');
        }
    }
};
