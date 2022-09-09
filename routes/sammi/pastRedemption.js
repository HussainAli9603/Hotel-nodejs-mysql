const express = require('express');
const ensureAuthenticated = require('../../helpers/auth');
const router = express.Router();
const moment = require('moment');
const Rewards = require('../../models/Rewards');
require('dotenv').config();
// required for file upload
const fs = require('fs');
const upload = require('../../helpers/imageUpload');



router.get('/', ensureAuthenticated, (req,res) => { // when do admin ensureAuthenticated -> ensureAuthenticatedAdmin
    res.render('rewards/pastRedemption');
})

router.get('/pastRedemption/:id', ensureAuthenticated, (req, res) => {
    Rewards.findByPk(req.params.id)
        .then((rewards) => {
            if (!rewards) {
                flashMessage(res, 'error', 'Reward not found');
                res.redirect('/rewards/pastRedemption');
                return;
            }
            if (req.user.id != rewards.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/rewards/pastRedemption');
                return;
            }

            res.render('rewards/pastRedemption', { rewards });
        })
        .catch(err => console.log(err));
});

router.post('/pastRedemption/:id', ensureAuthenticated, (req, res) => {
    let imageURL = req.body.imageURL;
    let amountOff = req.body.amountOff;
    let location = req.body.location;
    let points = req.body.points;

    Rewards.update(
        { imageURL, amountOff, location, points },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' Rewards updated');
            res.redirect('/rewards/pastRedemption');
        })
        .catch(err => console.log(err));
});

module.exports = router;