const express = require('express');
const router = express.Router();
const moment = require('moment');
const Event = require('../../../models/Event');
const flashMessage = require('../../../helpers/messenger');
const ensureAuthenticatedAdmin = require('../../../helpers/authAdmin');
const upload = require('../../../helpers/imageUpload');
require('dotenv').config();
// Required for file upload 
const fs = require('fs');

router.get("/", ensureAuthenticatedAdmin, async (req, res) => {
    Event.findAll({
        where: { UserId: req.user.id },
        order: [['date', 'DESC']],
        raw: true
    })
        .then((events) => {
            // pass object to userevent.handlebars
            res.render("events/admin/adminevent", { events });
        })
        .catch(err => console.log(err));
});

router.get('/addEvent', ensureAuthenticatedAdmin, (req, res) => {
    res.render("events/admin/addEvent");
});

router.post('/addEvent', ensureAuthenticatedAdmin, (req, res) => {
    let name = req.body.name;
    let imageURL = req.body.imageURL;
    let price = req.body.price;
    let date = moment(req.body.date, 'DD/MM/YYYY');
    let UserId = req.user.id;

    Event.create(
        { name, imageURL, price, date, UserId }
    )
        .then((event) => {
            console.log(event.toJSON());
            res.redirect('/admin/events');
        })
        .catch(err => console.log(err))
});

router.get('/editEvent/:id', ensureAuthenticatedAdmin, (req, res) => {
    Event.findByPk(req.params.id)
        .then((event) => {
            if (!event) {
                flashMessage(res, 'error', 'Event not found');
                res.redirect('/admin/events');
                return;
            }
            if (req.user.id != event.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/admin/events');
                return;
            }

            res.render('events/admin/editevent', { event });
        })
        .catch(err => console.log(err));
});

router.post('/editEvent/:id', ensureAuthenticatedAdmin, (req, res) => {
    let name = req.body.name;
    let imageURL = req.body.imageURL;
    let price = req.body.price;
    let date = moment(req.body.date, 'DD/MM/YYYY');

    Event.update(
        { name, imageURL, price, date },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' event updated');
            res.redirect('/admin/events');
        })
        .catch(err => console.log(err));
});

router.get('/deleteEvent/:id', ensureAuthenticatedAdmin, async function (req, res) {
    try {
        let event = await Event.findByPk(req.params.id);
        if (!event) {
            flashMessage(res, 'error', 'Event not found');
            res.redirect('/admin/events');
            return;
        }
        if (req.user.id != event.UserId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/admin/events');
            return;
        }

        let result = await Event.destroy({ where: { id: event.id } });
        console.log(result + ' event deleted');
        res.redirect('/admin/events');
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