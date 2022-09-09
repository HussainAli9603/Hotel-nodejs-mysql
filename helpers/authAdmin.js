const UserType = require("../models/UserType");
const db = require("../config/DBConfig");

const ensureAuthenticatedAdmin = (req, res, next) => {
    // Get user type id for admin
    // UserType.findOne({
    //     where: description === 'Consumer'
    db.query("SELECT id FROM UserTypes WHERE description = 'Admin'").then((results) => {
        let adminTypeId = results[0][0].id;

        if (req.isAuthenticated()) {
            if (req.user.UserTypeId === adminTypeId) {
                return next();
            }
        }
        res.redirect("/user/login");
    })
};

module.exports = ensureAuthenticatedAdmin;
