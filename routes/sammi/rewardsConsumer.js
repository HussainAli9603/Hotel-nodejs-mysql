
const express = require('express');
const ensureAuthenticated = require('../../helpers/auth');
const router = express.Router();
const moment = require('moment');
const Rewards = require('../../models/Rewards');
require('dotenv').config();
// required for file upload
const fs = require('fs');
const upload = require('../../helpers/imageUpload');

router.get('/', ensureAuthenticated, (req,res) => {
    Rewards.findAll({
        order: [['id', 'ASC']],
        raw: true
    })
        .then((rewards) => {
            // pass object to adminPromotions.handlebars
            res.render('rewards/userRewards', { rewards });
        })
        .catch(err => console.log(err));
})

router.get('/', ensureAuthenticated, (req,res) => { // when do admin ensureAuthenticated -> ensureAuthenticatedAdmin
    res.render('rewards/userRewards');
})

router.get('/redeemRewards', ensureAuthenticated, (req, res) => {
    res.render('rewards/redeemRewards');
});

router.get('/pastRedemption', ensureAuthenticated, (req,res) => { // when do admin ensureAuthenticated -> ensureAuthenticatedAdmin
    res.render('rewards/pastRedemptionUser');
})

module.exports = router;