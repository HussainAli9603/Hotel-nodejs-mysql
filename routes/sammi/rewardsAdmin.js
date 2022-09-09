const express = require('express');
const ensureAuthenticatedAdmin = require('../../helpers/authAdmin');
const router = express.Router();
const moment = require('moment');
const Rewards = require('../../models/Rewards');
require('dotenv').config();
// required for file upload
const fs = require('fs');
const upload = require('../../helpers/imageUpload');

router.get('/', ensureAuthenticatedAdmin, (req,res) => {
    Rewards.findAll({
        where: {UserId: req.user.id},
        order: [['points', 'DESC']],
        raw: true
    })
        .then((rewards) => {
            // pass object to userRewards.handlebars
            res.render('rewards/adminRewards', { rewards });
        })
        .catch(err => console.log(err));
})


router.get('/addRewards', ensureAuthenticatedAdmin, (req, res) => {
    res.render('rewards/addRewards');
});

router.post('/addRewards', ensureAuthenticatedAdmin, (req, res) => {
    let imageURL = req.body.imageURL;
    let amountOff = req.body.amountOff;
    let location = req.body.location;
    let points = req.body.points;
    let UserId = req.user.id;

    Rewards.create(
        { imageURL, amountOff, location, points, UserId }
    )
    .then((rewards) => {
        console.log(rewards.toJSON());
        res.redirect('/admin/rewards');
    })
    .catch(err => console.log(err))
})

router.get('/editRewards/:id', ensureAuthenticatedAdmin, (req, res) => {
    Rewards.findByPk(req.params.id)
        .then((rewards) => {
            if (!rewards) {
                flashMessage(res, 'error', 'Reward not found');
                res.redirect('/admin/rewards');
                return;
            }
            if (req.user.id != rewards.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/admin/rewards');
                return;
            }

            res.render('rewards/editRewards', { rewards });
        })
        .catch(err => console.log(err));
});

router.post('/editRewards/:id', ensureAuthenticatedAdmin, (req, res) => {
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
            res.redirect('/admin/rewards');
        })
        .catch(err => console.log(err));
});

router.get('/deleteReward/:id', ensureAuthenticatedAdmin, async function (req, res) {
    try {
        let rewards = await Rewards.findByPk(req.params.id);
        if (!rewards) {
            flashMessage(res, 'error', 'Reward not found');
            res.redirect('/admin/rewards');
            return;
        }
        if (req.user.id != rewards.UserId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/admin/rewards');
            return;
        }

        let result = await Rewards.destroy({ where: { id: rewards.id } });
        console.log(result + ' Reward deleted');
        res.redirect('/admin/rewards');
    }
    catch (err) {
        console.log(err);
    }
});


router.post('/upload', ensureAuthenticatedAdmin, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }

    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
        }
    });
});

module.exports = router;