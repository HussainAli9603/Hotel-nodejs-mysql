const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticatedAdminConsumer = require("../../helpers/authAdminConsumer");
const Chat = require("../../models/Chat");
const moment = require("moment");
const ChatService = require("../../services/ChatService");

router.get("/", ensureAuthenticatedAdminConsumer, async (req, res) => {
    let chatPreviews = [];
    let chatMessages = [];
    let allUsers = [];  // for starting a new message thread

    // Get all chat users
    chatPreviews = await ChatService.getChatPreviews(req.user.id);
    allUsers = await ChatService.getAllUsers();
    allUsers = allUsers.filter(x => x.id !== req.user.id);  // remove current user from start message thread

    // filter so that we don't show the same user type; i.e. consumers can only interact with admins
    allUsers = allUsers.filter(x => x.UserTypeId !== req.user.UserTypeId);

    let selectedUserId = -1;
    if (chatPreviews.length > 0)
        selectedUserId = chatPreviews[0].otherPartyId;

    // Get messages for specific chat user
    if (selectedUserId != -1)
        chatMessages = await ChatService.getChatsBetweenUser(req.user.id, selectedUserId);

    res.render("chat/index", {chatPreviews, chatMessages, selectedUserId, allUsers});
});

router.get("/:selectedUserId", ensureAuthenticatedAdminConsumer, async (req, res) => {
    let chatPreviews = [];
    let chatMessages = [];
    let selectedUserId = parseInt(req.params.selectedUserId);

    // Get all chat users
    chatPreviews = await ChatService.getChatPreviews(req.user.id);

    // Get messages for specific chat user
    if (selectedUserId !== -1)
        chatMessages = await ChatService.getChatsBetweenUser(req.user.id, selectedUserId);

    res.render("chat/index", {chatPreviews, chatMessages, selectedUserId});
})

router.post("/send", ensureAuthenticatedAdminConsumer, async (req, res) => {
    let {message, recipientId} = req.body;

    if (message == "" || recipientId == null) {
        flashMessage(res, "error", "Invalid message!");
        res.redirect("/chat/");
        return;
    }

    try {
        const chat = await Chat.create({
            timestamp: moment.now(),
            content: message,
            recipientId,
            senderId: req.user.id
        });
        flashMessage(res, "success", "Successfully sent message");
    } catch (e) {
        console.log(e.toString());
        flashMessage(res, "error", "Failed to send message");
    }

    res.redirect("/chat/");
});

router.post("/edit/:chatId", ensureAuthenticatedAdminConsumer, async (req, res) => {
    let chatId = parseInt(req.params.chatId);
    let {newContent} = req.body;

    let result = await ChatService.updateChatMessage(chatId, req.user.id, newContent);
    if (result)
        flashMessage(res, "success", "Successfully updated chat message");
    else
        flashMessage(res, "error", "Failed to update chat message");

    res.redirect("/chat/");
});

router.get("/delete/:chatId", ensureAuthenticatedAdminConsumer, async (req, res) => {
    let chatId = parseInt(req.params.chatId);

    let result = await ChatService.deleteChatMessage(chatId, req.user.id);
    if (result)
        flashMessage(res, "success", "Successfully deleted chat message");
    else
        flashMessage(res, "error", "Failed to delete message");

    res.redirect("/chat/");
});

module.exports = router;