const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Hotel = db.define('hotel',
    {
        hotelName: { type: Sequelize.STRING },
        hotelNO: { type: Sequelize.STRING(8) },
        hotelDesc: { type: Sequelize.STRING(2000) },
        logoURL: { type: Sequelize.STRING },
        paymentMethod: { type: Sequelize.STRING },
    });

module.exports = Hotel;