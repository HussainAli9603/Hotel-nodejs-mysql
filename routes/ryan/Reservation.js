const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Reservation = db.define('reservation',
    {
        check_in: { type: Sequelize.DATE },
        check_out: { type: Sequelize.DATE },
        adults: { type: Sequelize.INTEGER },
        child: { type: Sequelize.INTEGER },
        room : { type: Sequelize.STRING }
    });
    
module.exports = Reservation;