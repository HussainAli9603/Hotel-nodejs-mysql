const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Room = db.define('room',
    {
        roomName: { type: Sequelize.STRING },
        roomDesc: { type: Sequelize.STRING(2000) },
        roomPrice: { type: Sequelize.FLOAT },
        logoURL: { type: Sequelize.STRING },
    });

module.exports = Room;