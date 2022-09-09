const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const RoomBooking = db.define('roomBooking',
    {
        numofGuest: { type: Sequelize.STRING },
        checkIn: { type: Sequelize.STRING(2000) },
        checkOut: { type: Sequelize.DECIMAL(2)},
        roomType: { type: Sequelize.STRING },
    });

module.exports = RoomBooking;