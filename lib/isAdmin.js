const isAdmin = async (sock, chatId, senderId) => {

    const groupMetadata = await sock.groupMetadata(chatId)

    const participants = groupMetadata.participants

    const sender =
    participants.find(p => p.id === senderId)

    const bot =
    participants.find(
        p => p.id === sock.user.id
    )

    const isSenderAdmin =
    sender?.admin === 'admin' ||
    sender?.admin === 'superadmin'

    const isBotAdmin =
    bot?.admin === 'admin' ||
    bot?.admin === 'superadmin'

    return {
        isSenderAdmin,
        isBotAdmin
    }
}

export default isAdmin
