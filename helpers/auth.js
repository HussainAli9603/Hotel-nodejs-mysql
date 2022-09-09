const UserType = require('../models/UserType');
const db = require("../config/DBConfig");

// For consumer accounts only
const ensureAuthenticated = (req, res, next) => {
    db.query("SELECT id FROM UserTypes WHERE description = 'Consumer'").then((results) => {
        let consumerTypeId = results[0][0].id;
        if (req.isAuthenticated()) {
            if (req.user.UserTypeId === consumerTypeId) {
                return next();
            }
        }
        res.redirect('/user/login');
    });
};

module.exports = ensureAuthenticated;