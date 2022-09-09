const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create rewards table in MySQL Database
const PastRedemption = db.define('pastRedemption',
    {
        imageURL: { type: Sequelize.STRING },
        amountOff: { type: Sequelize.STRING },
        location: { type: Sequelize.STRING },
        points: { type: Sequelize.STRING },
    });

module.exports = PastRedemption;