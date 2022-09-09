const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create rewards table in MySQL Database
const Promotions = db.define('promotions',
    {
        Num : { type: Sequelize.STRING },
        imageURL: { type: Sequelize.STRING },
        Room_Promotion: { type: Sequelize.STRING },
        Promotion: { type: Sequelize.STRING },
        Percentage : { type: Sequelize.STRING },
        DateHeld: { type: Sequelize.DATE },
    });

module.exports = Promotions;