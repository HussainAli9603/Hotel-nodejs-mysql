const express = require('express');
const router = express.Router();
const moment = require('moment');
const Event = require('../../models/Event');
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
require('dotenv').config();
// Required for file upload 
const fs = require('fs');
const upload = require('../../helpers/imageUpload');

// VERNON
router.get('/', ensureAuthenticated, (req, res) => {
    Event.findAll({
        order: [['date', 'DESC']],
        raw: true
    })
        .then((events) => {
            // pass object to userevent.handlebars
            res.render('events/userevent', { events });
        })
        .catch(err => console.log(err));
});


router.get('/Booking', ensureAuthenticated, (req, res) => {
    Event.findAll({
        raw: true
    })
        .then((events)=>{
            res.render('events/userbookevent', { events });
        })
        .catch(err => console.log(err))
});


module.exports = router;