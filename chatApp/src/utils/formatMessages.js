
export async function formatMessages(messages, currentUser, otherUser) {
    return messages.map(message => {
        const senderName =
        message.senderId === currentUser.uid ? currentUser.displayName : otherUser.displayName;
        return `${senderName}: ${message.text}`;
    })
    .join("\n")
}