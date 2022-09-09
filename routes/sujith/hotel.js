const express = require('express');
const router = express.Router();
const moment = require('moment');
const Hotel = require('../../models/Hotel');
const ensureAuthenticatedAdmin = require('../../helpers/authAdmin');
const flashMessage = require('../../helpers/messenger');
require('dotenv').config();
const fetch = require('node-fetch');
// Required for file upload 
const fs = require('fs');
const upload = require('../../helpers/imageUpload');

router.get('/', ensureAuthenticatedAdmin, (req, res) => {
    Hotel.findAll({
        where: { userId: req.user.id },
        order: [['hotelName', 'DESC']],
        raw: true
    })
        .then((hotels) => {
            // pass object to listHotel.handlebar
            res.render('hotel/listHotel', { hotels });
        })
        .catch(err => console.log(err));
});

router.get('/addHotel', ensureAuthenticatedAdmin, (req, res) => {
    res.render('hotel/addHotel');
});

router.post('/addHotel', ensureAuthenticatedAdmin, async (req, res) => {
    let hotelName = req.body.hotelName;
    let hotelDesc = req.body.hotelDesc.slice(0, 1999);
    let hotelNO = req.body.hotelNO;
    let logoURL = req.body.logoURL;
    let paymentMethod = req.body.paymentMethod.toString();
    // Multi-value components return array of strings or undefined
    let UserId = req.user.id;

    await Hotel.create(
        { hotelName, hotelDesc, hotelNO, logoURL, paymentMethod, UserId }
    )
        .then((hotel) => {
            console.log(hotel.toJSON());
            res.redirect('/admin/hotel');
        })
        .catch(err => console.log(err))
});

router.get('/editHotel/:id', ensureAuthenticatedAdmin, (req, res) => {
    Hotel.findByPk(req.params.id)
        .then((hotel) => {
            if (!hotel) {
                flashMessage(res, 'error', 'Details not found');
                res.redirect('/admin/hotel');
                return;
            }
            if (req.user.id != hotel.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/admin/hotel');
                return;
            }

            res.render('hotel/editHotel', { hotel });
        })
        .catch(err => console.log(err));
});

router.post('/editHotel/:id', ensureAuthenticatedAdmin, (req, res) => {
    let hotelName = req.body.hotelName;
    let hotelDesc = req.body.hotelDesc.slice(0, 1999);
    let hotelNO = req.body.hotelNO;
    let logoURL = req.body.logoURL;
    let paymentMethod = req.body.paymentMethod.toString();

    Hotel.update(
        { hotelName, hotelDesc, hotelNO, logoURL, paymentMethod },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' hotel updated');
            res.redirect('/admin/hotel');
        })
        .catch(err => console.log(err));
});

router.get('/deleteHotel/:id', ensureAuthenticatedAdmin, async function (req, res) {
    try {
        let hotel = await Hotel.findByPk(req.params.id);
        if (!hotel) {
            flashMessage(res, 'error', 'Video not found');
            res.redirect('/admin/hotel');
            return;
        }
        if (req.user.id != hotel.UserId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/admin/hotel');
            return;
        }

        let result = await Hotel.destroy({ where: { id: hotel.id } });
        console.log(result + ' Hotel deleted');
        res.redirect('/admin/hotel');
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