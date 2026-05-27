const gayCommand = {
    name: 'gay',
    alias: ['marica', 'trolo'],
    category: 'fun',
    run: async (m, { conn }) => {
        const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
        const userNumber = who.split('@')[0];
        const percent = Math.floor(Math.random() * 100);

        const styles = [
            `╭───〔 🌈 GAYÓMETRO 〕───╮
│
│ 👤 Usuario: @${userNumber}
│ 📊 Resultado: ${percent}%
│
│ 🧪 Estado: ${percent > 70 ? 'Muy sospechoso' : 'Normal'}
╰────────────────────╯`,

            `╭───〔 📊 ANALISIS SYSTEM 〕───╮
│
│ Target: @${userNumber}
│ Scan: ${percent}%
│
│ Resultado global registrado
╰────────────────────╯`,

            `╭───〔 🧬 ADN SCAN 〕───╮
│
│ Sujeto: @${userNumber}
│ Gen arcoíris: ${percent}%
│
│ Estado: ${percent > 80 ? 'ACTIVO' : 'INACTIVO'}
╰────────────────────╯`
        ];

        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        try {
            let avatarUrl;

            try {
                avatarUrl = await conn.profilePictureUrl(who, 'image');
            } catch {
                avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userNumber)}&background=222&color=fff&size=512`;
            }

            const imageUrl = `https://some-random-api.com/canvas/overlay/gay?avatar=${encodeURIComponent(avatarUrl)}`;

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: imageUrl },
                    caption: selectedStyle,
                    mentions: [who]
                },
                { quoted: m }
            );

        } catch (e) {
            await conn.sendMessage(
                m.chat,
                {
                    text:
`╭───〔 🌈 GAYÓMETRO 〕───╮
│
│ 👤 Usuario: @${userNumber}
│ 📊 Resultado: ${percent}%
╰────────────────────╯`,
                    mentions: [who]
                },
                { quoted: m }
            );
        }
    }
};

export default gayCommand;
