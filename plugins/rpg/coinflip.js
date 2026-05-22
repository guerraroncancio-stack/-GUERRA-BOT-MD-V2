export default {
    name: 'coinflip',
    alias: ['cf', 'caraocruz', 'apuestacf'],
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

            if (!args[0] || !args[1]) {
                const helpMsg = `🎰 *MENÚ DE COINFLIP* 🎰\n\n` +
                                `Prueba tu suerte lanzando una moneda virtual. Si aciertas, ¡duplicas tu apuesta! Si fallas, lo pierdes todo.\n\n` +
                                `*Uso:* ${usedPrefix || '#'}${command || 'cf'} <cantidad> <cara/cruz>\n` +
                                `*Ejemplo:* ${usedPrefix || '#'}${command || 'cf'} 500 cara\n\n` +
                                `*Límites de apuesta:*\n💰 Mínimo: 100\n💎 Máximo: 100,000,000`;
                return m.reply(helpMsg);
            }

            const currentBalance = user.col || 0;
            let bet = parseInt(args[0]);
            let choice = args[1].toLowerCase();

            if (isNaN(bet)) return m.reply('『 ❌ 』 La cantidad a apostar debe ser un número válido.');
            if (choice !== 'cara' && choice !== 'cruz') return m.reply('『 ❌ 』 Debes elegir específicamente "cara" o "cruz".');
            if (bet < 100) return m.reply('『 ❌ 』 La apuesta mínima es de 💰 100.');
            if (bet > 100000000) return m.reply('『 ❌ 』 La apuesta máxima permitida es de 💰 100,000,000.');
            if (currentBalance < bet) return m.reply(`『 ❌ 』 Fondos insuficientes. Tu saldo actual es: 💰 ${currentBalance.toLocaleString()}`);

            await global.User.updateOne({ id: m.sender }, { $inc: { col: -bet } });

            let result = Math.random() < 0.5 ? 'cara' : 'cruz';
            let reward = 0;
            let resultText = '';

            if (choice === result) {
                reward = bet * 2;
                resultText = `🎉 *¡GANASTE!* (💰 +${reward.toLocaleString()})`;
                await global.User.updateOne({ id: m.sender }, { $inc: { col: reward } });
            } else {
                resultText = `💔 *PERDISTE* (💰 -${bet.toLocaleString()})`;
            }

            const finalBalance = currentBalance - bet + reward;

            const finalScreen = `🪙 *C O I N F L I P* 🪙\n\n` +
                                `🎯 Elegiste: *${choice.toUpperCase()}*\n` +
                                `🎲 La moneda cayó en: *${result.toUpperCase()}*\n\n` +
                                `↳ ${resultText}\n` +
                                `💳 *Tu Saldo:* 💰 ${finalBalance.toLocaleString()}`;

            return m.reply(finalScreen);

        } catch (e) {
            console.error(e);
            m.reply('『 ❌ 』 Ocurrió un error en el sistema de apuestas.');
        }
    }
};
