const express = require('express');
const ensureAuthenticatedAdmin = require('../../helpers/authAdmin'); // admin - authAdmin
const router = express.Router();
const moment = require('moment');
const Promotions = require('../../models/Promotions');
require('dotenv').config();
// required for file upload
const fs = require('fs');
const upload = require('../../helpers/imageUpload');

router.get('/', ensureAuthenticatedAdmin, (req,res) => {
    Promotions.findAll({
        where: {UserId: req.user.id},
        order: [['id', 'ASC']],
        raw: true
    })
        .then((promotions) => {
            // pass object to adminPromotions.handlebars
            res.render('promotions/adminPromotions', { promotions });
        })
        .catch(err => console.log(err));
})

router.get('/', ensureAuthenticatedAdmin, (req,res) => { // when do admin ensureAuthenticated -> ensureAuthenticatedAdmin
    res.render('promotions/adminPromotions');
})

router.get('/addPromotions', ensureAuthenticatedAdmin, (req, res) => {
    res.render('promotions/addPromotions');
});

router.post('/addPromotions', ensureAuthenticatedAdmin, (req, res) => {
    let Num = req.body.num;
    let imageURL = req.body.imageURL;
    let Room_Promotion = req.body.Room_Promotion;
    let Promotion = req.body.Promotion;
    let Percentage = req.body.Percentage;
    let DateHeld = req.body.DateHeld;
    let UserId = req.user.id;

    Promotions.create(
        { Num, imageURL, Room_Promotion, Promotion, Percentage, DateHeld, UserId }
    )
    .then((promotions) => {
        console.log(promotions.toJSON());
        res.redirect('/admin/adminPromotions');
    })
    .catch(err => console.log(err))
})

router.get('/editPromotions/:id', ensureAuthenticatedAdmin, (req, res) => {
    Promotions.findByPk(req.params.id)
        .then((promotions) => {
            if (!promotions) {
                flashMessage(res, 'error', 'Promotion not found');
                res.redirect('/admin/adminPromotions');
                return;
            }
            if (req.user.id != promotions.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/admin/adminPromotions');
                return;
            }

            res.render('promotions/editPromotions', { promotions });
        })
        .catch(err => console.log(err));
});

router.post('/editPromotions/:id', ensureAuthenticatedAdmin, (req, res) => {
    let Num = req.body.num;
    let imageURL = req.body.imageURL;
    let Room_Promotion = req.body.Room_Promotion;
    let Percentage = req.body.Percentage;
    let DateHeld = req.body.DateHeld;
    let UserId = req.user.id;

    Promotions.update(
        { Num, imageURL, Room_Promotion, Promotion, Percentage, DateHeld, UserId },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' Promotion updated');
            res.redirect('/admin/adminPromotions');
        })
        .catch(err => console.log(err));
});

router.get('/deletePromotions/:id', ensureAuthenticatedAdmin, async function (req, res) {
    try {
        let promotions = await Promotions.findByPk(req.params.id);
        if (!promotions) {
            flashMessage(res, 'error', 'Promotion not found');
            res.redirect('/admin/adminPromotions');
            return;
        }
        if (req.user.id != promotions.UserId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/admin/adminPromotions');
            return;
        }

        let result = await Promotions.destroy({ where: { id: promotions.id } });
        console.log(result + ' Promotion deleted');
        res.redirect('/admin/adminPromotions');
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