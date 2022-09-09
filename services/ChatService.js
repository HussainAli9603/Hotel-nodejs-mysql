const Chat = require("../models/Chat");
const User = require("../models/User");
const {Op, QueryTypes} = require("sequelize");
const db = require("../config/DBConfig");  // const sequelize; instance of sequelize object

// TODO: Fix bug when starting a new message thread with empty message
const getChatPreviews = async (userId) => {
    let chats = await getChatsForUser(userId);
    let seen = [];
    let ret = [];

    for (const c of chats) {
        // console.log(`chats recipient id: ${c.recipientId}`);
        let otherPartyId;
        if (c.senderId !== userId)
            otherPartyId = c.senderId;
        else
            otherPartyId = c.recipientId;

        let nameUser = await User.findByPk(otherPartyId);
        if (nameUser == null) {
            console.log(`Unable to get name for other party id ${otherPartyId}`)
            continue;
        }

        let name = nameUser.name

        let latestTimestamp;
        let lastMsg = "";
        let read = true;
        for (const c of chats.filter((c) =>
            (c.senderId === userId && c.recipientId === otherPartyId) ||
            (c.recipientId === userId && c.senderId === otherPartyId)
        )) {
            if (lastMsg === "" || latestTimestamp === null || latestTimestamp < c.timestamp) {
                lastMsg = c.content;
                latestTimestamp = c.timestamp;
                read = (c.recipientId === userId) ? c.read : true;
            }
        }

        if (!seen.includes(otherPartyId)) {
            ret.push({
                name,
                otherPartyId,
                latestTimestamp,
                lastMsg,
                read
            });
            seen.push(otherPartyId);
        }
    }

    // Sort by most recent chats first
    ret.sort((a, b) => {
        return b.latestTimestamp - a.latestTimestamp;
    });

    return ret;
};

// const getChatMessagesForTarget = (userId, targetId) => {
//     let chats = await Chat.findAll(
//         {where: [Op.or]: {
//         {senderId: userId}  // todo
//     }});
// };

// Return all chats that involve the user
const getChatsForUser = async userId => {
    let foundChats = await Chat.findAll({
        where: {[Op.or]: [{senderId: userId}, {recipientId: userId}]},
        include: ["sender", "recipient"]
    });
    if (foundChats == null)
        foundChats = [];
    return foundChats;
};

const userHasUnreadChats = async userId => {
    let unreadChats = await Chat.findAll({
        where: {
            recipientId: userId,
            read: false
        },
        include: ["sender", "recipient"]
    });

    return unreadChats.length > 0;
};

// Get chats between two users, where userId is the account logged in
const getChatsBetweenUser = async (userId, otherPartyId) => {
    let chats = await getChatsForUser(userId);
    chats = chats.filter((c) =>
        (c.senderId === otherPartyId) ||
        (c.recipientId === otherPartyId));

    // Set all chats to our user to read
    const ret = []
    for (const c of chats) {
        ret.push(JSON.parse(JSON.stringify(c)));  // deep copy hack
        if (c.recipientId === userId) {
            c.read = true;
            await c.save();
        }
    }

    return ret;
}

// User ID has to be provided for security verification
// Returns the success as a bool.
const updateChatMessage = async (chatId, userId, new_content) => {
    let chat = await Chat.findByPk(chatId);
    if (chat !== null) {
        if (chat.senderId === userId) {
            chat.content = new_content;
            await chat.save();
            return true;
        }
    }
    return false;
};

// User ID has to be provided for security verification
// Returns the success as a bool.
const deleteChatMessage = async (chatId, userId) => {
    let chat = await Chat.findByPk(chatId);
    if (chat !== null) {
        if (chat.senderId === userId) {
            await chat.destroy();
            return true;
        }
    }
    return false;
};

// Get all VERIFIED users
const getAllUsers = async () => {
    let users = await db.query("SELECT id, name, UserTypeId FROM Users WHERE verified = '1'", {
        logging: console.log,
        type: QueryTypes.SELECT
    });
    return users;
};

module.exports = {getChatPreviews, getChatsBetweenUser, userHasUnreadChats, updateChatMessage, deleteChatMessage,
                  getAllUsers};