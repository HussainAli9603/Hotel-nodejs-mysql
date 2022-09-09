const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create Feedback table in MySQL Database
const Feedback = db.define('feedback',
    {
        name: { type: Sequelize.STRING },
        rating: { type: Sequelize.STRING },
        addComments: { type: Sequelize.STRING(2000) }
    });

module.exports = Feedback;