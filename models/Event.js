const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create Events table in MySQL Database
const Event = db.define('event',
    {
        name: { type: Sequelize.STRING },
        imageURL: { type: Sequelize.STRING },
        price: { type: Sequelize.STRING },
        date: { type: Sequelize.DATE }
    });

module.exports = Event;