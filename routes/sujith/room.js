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
const  Room = require('../../models/Room');

router.get('/', ensureAuthenticatedAdmin, (req, res) => {
    Hotel.findAll({
        where: { userId: req.user.id },
        order: [['roomName', 'DESC']],
        raw: true
    })
        .then((hotels) => {
            // pass object to listHotel.handlebar
            res.render('room/listRoom', { hotels });
        })
        .catch(err => console.log(err));
});

router.get('/addRoom', ensureAuthenticatedAdmin, (req, res) => {
    res.render('room/addRoom');
});

router.post('/addRoom', ensureAuthenticatedAdmin, async (req, res) => {
    let roomName = req.body.roomName;
    let roomDesc = req.body.roomDesc.slice(0, 1999);
    let roomPrice = req.body.roomPrice;
    let logoURL = req.body.logoURL;
    // Multi-value components return array of strings or undefined
    let UserId = req.user.id;

    await Room.create(
        { roomName, roomDesc, roomPrice, logoURL, UserId }
    )
        .then((hotel) => {
            console.log(hotel.toJSON());
            res.redirect('/admin/hotel');
        })
        .catch(err => console.log(err))
});

router.get('/editRoom/:id', ensureAuthenticatedAdmin, (req, res) => {
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

            res.render('room/editRoom', { hotel });
        })
        .catch(err => console.log(err));
});

router.post('/editRoom/:id', ensureAuthenticatedAdmin, (req, res) => {
    let roomName = req.body.roomName;
    let roomDesc = req.body.roomDesc.slice(0, 1999);
    let roomPrice = req.body.roomPrice;
    let logoURL = req.body.logoURL;

    Hotel.update(
        { roomName, roomDesc, roomPrice, logoURL },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' Room updated');
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

// Redone by Ashlee
// This GET endpoint allows all the rooms of ONE hotel to be displayed.
router.get('/:id', ensureAuthenticatedAdmin, async (req, res) => {
    const rooms = await Room.findAll({
        where: { hotelId: req.params.id }
    });

    res.render('room/listRoom', { rooms, hotelId: req.params.id });
});

router.get('/:id/addRoom', ensureAuthenticatedAdmin, (req, res) => {
    res.render('room/addRoom');
});

router.post('/:id/addRoom', ensureAuthenticatedAdmin, async (req, res) => {
    let roomName = req.body.roomName;
    let roomDesc = req.body.roomDesc.slice(0, 1999);
    let roomPrice = req.body.roomPrice;
    let logoURL = req.body.logoURL;
    // Multi-value components return array of strings or undefined
    let UserId = req.user.id;

    await Room.create(
        { roomName, roomDesc, roomPrice, logoURL, UserId, hotelId: req.params.id }
    )
        .then((hotel) => {
            console.log(hotel.toJSON());
            res.redirect('/admin/hotel');
        })
        .catch(err => console.log(err))
});

module.exports = router;