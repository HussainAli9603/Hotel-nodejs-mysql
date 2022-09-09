const express = require('express');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
const Feedback = require('../../models/Feedback');
require('dotenv').config();

router.get('/', ensureAuthenticated, (req, res) => {
    Feedback.findAll({
        order: [['id', 'DESC']],
        raw: true
    })
        .then((feedback) => {
            // pass object to userfeedback.handlebars
            res.render('feedback/userFeedback', { feedback });
        })
        .catch(err => console.log(err));
});

router.get('/addFeedback', ensureAuthenticated, (req, res) => {
    res.render('feedback/addFeedback');
});

router.post('/addFeedback', ensureAuthenticated, (req, res) => {
    let name = req.body.name;
    let rating = req.body.rating;
    let addComments = req.body.addComments;
    let UserId = req.user.id;

    Feedback.create(
        { name, rating, addComments, UserId }
    )
        .then((feedback) => {
            console.log(feedback.toJSON());
            res.redirect('/reviews');
        })
        .catch(err => console.log(err))
});

router.get('/editFeedback/:id', ensureAuthenticated, (req, res) => {
    Feedback.findByPk(req.params.id)
        .then((feedback) => {
            if (!feedback) {
                flashMessage(res, 'error', 'Feedback not found');
                res.redirect('/reviews');
                return;
            }
            if (req.user.id != feedback.UserId) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/reviews');
                return;
            }

            res.render('feedback/editfeedback', { feedback });
        })
        .catch(err => console.log(err));
});

router.post('/editFeedback/:id', ensureAuthenticated, (req, res) => {
    let name = req.body.name;
    let rating = req.body.rating;
    let addComments = req.body.addComments;
    let UserId = req.user.id;

    Feedback.update(
        { name, rating, addComments, UserId },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' feedback updated');
            res.redirect('/reviews');
        })
        .catch(err => console.log(err));
});

router.get('/deleteFeedback/:id', ensureAuthenticated, async function (req, res) {
    try {
        let feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) {
            flashMessage(res, 'error', 'Feedback not found');
            res.redirect('/reviews');
            return;
        }
        if (req.user.id != feedback.UserId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/reviews');
            return;
        }

        let result = await Feedback.destroy({ where: { id: feedback.id } });
        console.log(result + ' feedback deleted');
        res.redirect('/reviews');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;