const express = require('express');
const ensureAuthenticated = require('../../helpers/auth'); // admin - authAdmin
const router = express.Router();
const moment = require('moment');
const Promotions = require('../../models/Promotions');

router.get('/', ensureAuthenticated, (req,res) => { // when do admin ensureAuthenticated -> ensureAuthenticatedAdmin
    res.render('promotions/userPromotions');
})

module.exports = router;