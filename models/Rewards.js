const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create rewards table in MySQL Database
const Rewards = db.define('rewards',
    {
        imageURL: { type: Sequelize.STRING },
        amountOff: { type: Sequelize.STRING },
        location: { type: Sequelize.STRING },
        points: { type: Sequelize.STRING },
    });

module.exports = Rewards;