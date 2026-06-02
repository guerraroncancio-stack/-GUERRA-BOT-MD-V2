global.clans = global.clans || {}
global.clanWars = global.clanWars || {}
global.clanTournaments = global.clanTournaments || {}

const clanSystem = {
    name: 'clan',
    alias: ['clanes', 'guild', 'team'],
    category: 'games',

    run: async (m, { conn, text }) => {

        const user = m.sender
        const args = (text || '').split(' ')
        const sub = (args[0] || '').toLowerCase()

        // =========================
        // HELP
        // =========================
        if (!sub || sub === 'help') {
            return m.reply(`
🛡️ *CLAN SYSTEM PRO MAX*

.clan crear <nombre>
.clan join <nombre>
.clan leave
.clan info

⚔️ .clan war
🏆 .clan tournament
📊 .clan top
`)
        }

        // =========================
        // CREATE CLAN
        // =========================
        if (sub === 'crear') {

            const name = args.slice(1).join(' ')
            if (!name) return m.reply('⚠️ Usa: .clan crear Nombre')

            if (Object.values(global.clans).find(c => c.owner === user)) {
                return m.reply('❌ Ya tienes un clan.')
            }

            const id = 'clan_' + Date.now()

            global.clans[id] = {
                id,
                name,
                owner: user,
                members: [user],
                points: 0,
                wins: 0,
                loses: 0,
                level: 1
            }

            return m.reply(`🛡️ Clan creado: ${name}`)
        }

        // =========================
        // JOIN CLAN
        // =========================
        if (sub === 'join') {

            const name = args.slice(1).join(' ')
            const clan = Object.values(global.clans)
                .find(c => c.name.toLowerCase() === name.toLowerCase())

            if (!clan) return m.reply('❌ Clan no encontrado')
            if (clan.members.includes(user)) return m.reply('⚠️ Ya estás en este clan')

            clan.members.push(user)

            return m.reply(`✅ Te uniste a ${clan.name}`)
        }

        // =========================
        // LEAVE CLAN
        // =========================
        if (sub === 'leave') {

            const clan = Object.values(global.clans)
                .find(c => c.members.includes(user))

            if (!clan) return m.reply('❌ No estás en un clan')

            clan.members = clan.members.filter(x => x !== user)

            return m.reply('👋 Saliste del clan')
        }

        // =========================
        // INFO CLAN
        // =========================
        if (sub === 'info') {

            const clan = Object.values(global.clans)
                .find(c => c.members.includes(user))

            if (!clan) return m.reply('❌ No estás en un clan')

            return conn.sendMessage(m.chat, {
                text: `
🛡️ *CLAN INFO*

🏷️ ${clan.name}
👑 Owner: @${clan.owner.split('@')[0]}
👥 Members: ${clan.members.length}
⚡ Points: ${clan.points}
🏆 Wins: ${clan.wins}
❌ Loses: ${clan.loses}
⭐ Level: ${clan.level}
                `,
                mentions: clan.members
            }, { quoted: m })
        }

        // =========================
        // TOP CLAN
        // =========================
        if (sub === 'top') {

            const top = Object.values(global.clans)
                .sort((a, b) => b.points - a.points)
                .slice(0, 10)

            let txt = `🏆 *TOP CLANES GLOBAL*\n\n`

            top.forEach((c, i) => {
                txt += `#${i + 1} ${c.name}\n`
                txt += `⚡ Points: ${c.points} | 🏆 Wins: ${c.wins}\n\n`
            })

            return m.reply(txt)
        }

        // =========================
        // CLAN WAR (SIMPLE MATCH)
        // =========================
        if (sub === 'war') {

            const clan = Object.values(global.clans)
                .find(c => c.members.includes(user))

            if (!clan) return m.reply('❌ No estás en un clan')

            const enemy = Object.values(global.clans)
                .find(c => c.id !== clan.id)

            if (!enemy) return m.reply('❌ No hay clanes enemigos')

            const win = Math.random() > 0.5

            if (win) {
                clan.wins++
                clan.points += 50
                enemy.loses++
            } else {
                clan.loses++
                enemy.wins++
                enemy.points += 50
            }

            return conn.sendMessage(m.chat, {
                text: `
⚔️ *CLAN WAR RESULT*

🛡️ ${clan.name} VS ${enemy.name}

🏆 Winner: ${win ? clan.name : enemy.name}

+50 points al ganador
                `
            }, { quoted: m })
        }

        // =========================
        // TOURNAMENT (RANDOM)
        // =========================
        if (sub === 'tournament') {

            const clans = Object.values(global.clans)
            if (clans.length < 2) return m.reply('❌ No hay suficientes clanes')

            const [a, b] = clans.sort(() => Math.random() - 0.5)

            const win = Math.random() > 0.5
            const winner = win ? a : b

            winner.points += 100
            winner.wins++

            return conn.sendMessage(m.chat, {
                text: `
🏆 *CLAN TOURNAMENT*

🛡️ ${a.name} VS ${b.name}

🥇 Winner: ${winner.name}

💎 +100 points
                `
            }, { quoted: m })
        }
    }
}

export default clanSystem
