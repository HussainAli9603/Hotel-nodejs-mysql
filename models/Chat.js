const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

// Create chats table in db
const Chat = db.define("Chat", {
    timestamp: {type: Sequelize.DATE},
    content: {type: Sequelize.STRING(1000)},
    read: {type: Sequelize.BOOLEAN, defaultValue: false}
});

module.exports = Chat;