const wallet = {
    name: 'wallet',
    alias: ['bal', 'balance', 'money', 'eco'],
    category: 'economy',

    run: async (m, { conn, args }) => {

        try {

            global.db.data = global.db.data || {};
            global.db.data.users = global.db.data.users || {};

            const user = m.sender;

            // =========================
            // INIT USER
            // =========================

            if (!global.db.data.users[user]) {
                global.db.data.users[user] = {
                    money: 0,
                    bank: 0,
                    lastDaily: 0
                };
            }

            const data = global.db.data.users[user];

            const option = (args[0] || '').toLowerCase();

            // =========================
            // PANEL
            // =========================

            if (!option || option === 'me') {

                return conn.sendMessage(m.chat, {
                    text:
`💰 *WALLET ECONOMY*

👤 Usuario: @${user.split('@')[0]}

💵 Dinero: ${data.money}
🏦 Banco: ${data.bank}
💎 Total: ${data.money + data.bank}

📌 Usa:
.wallet add <cantidad>
.wallet remove <cantidad>
.wallet transfer @user <cantidad>`
                }, { mentions: [user] }, { quoted: m });
            }

            // =========================
            // ADD MONEY (ADMIN ONLY BASIC)
            // =========================

            if (option === 'add') {

                const amount = parseInt(args[1]);

                if (isNaN(amount)) {
                    return m.reply('❌ Usa: .wallet add <cantidad>');
                }

                data.money += amount;

                return m.reply(`💰 Se añadieron ${amount} monedas`);
            }

            // =========================
            // REMOVE MONEY
            // =========================

            if (option === 'remove') {

                const amount = parseInt(args[1]);

                if (isNaN(amount)) {
                    return m.reply('❌ Usa: .wallet remove <cantidad>');
                }

                data.money = Math.max(0, data.money - amount);

                return m.reply(`💸 Se removieron ${amount} monedas`);
            }

            // =========================
            // TRANSFER
            // =========================

            if (option === 'transfer') {

                const target = m.mentionedJid?.[0];
                const amount = parseInt(args[2]);

                if (!target || isNaN(amount)) {
                    return m.reply('❌ Usa: .wallet transfer @user <cantidad>');
                }

                if (data.money < amount) {
                    return m.reply('❌ No tienes suficiente dinero');
                }

                if (!global.db.data.users[target]) {
                    global.db.data.users[target] = {
                        money: 0,
                        bank: 0,
                        lastDaily: 0
                    };
                }

                data.money -= amount;
                global.db.data.users[target].money += amount;

                return conn.sendMessage(m.chat, {
                    text:
`💸 *TRANSFERENCIA*

@${user.split('@')[0]} envió ${amount} monedas a @${target.split('@')[0]}`,
                    mentions: [user, target]
                }, { quoted: m });
            }

            // =========================
            // INVALID
            // =========================

            return m.reply(
`💰 Uso wallet:

.wallet
.wallet add <cantidad>
.wallet remove <cantidad>
.wallet transfer @user <cantidad>`
            );

        } catch (e) {
            console.log('[WALLET ERROR]', e);
            m.reply('❌ Error en wallet system');
        }
    }
};

export default wallet;
