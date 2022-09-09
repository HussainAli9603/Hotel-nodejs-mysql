const UserType = require("../models/UserType");
const db = require("../config/DBConfig");

// This helper middleware allows both admin and consumer to access the endpoint
const ensureAuthenticatedAdminConsumer = (req, res, next) => {
    // Get user type id for admin
    // UserType.findOne({
    //     where: description === 'Consumer'
    db.query("SELECT id FROM UserTypes").then((results) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/user/login");
    })
};

module.exports = ensureAuthenticatedAdminConsumer;
