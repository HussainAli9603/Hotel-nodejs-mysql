const express = require('express');
const { request } = require('http');
const router = express.Router();
const Reservation = require('../Models/Reservation');

router.get('/', (req, res) => {
	const title = 'Hovago';
	// renders views/index.handlebars, passing title as an object
	res.render('Home', { title: title })
});

router.post('/', async (req, res) => {
	let { check_in, check_out, adult, children, room } = req.body;
	// const ci = req.body.check_in;
	// const co = req.body.check_out;
	// const adult = req.body.adult;
	// const children = req.body.children;
	// const room = req.body.room;
	let reservation = await Reservation.create({check_in, check_out, adults: adult, child: children, room});
	res.redirect('booked');
});

router.get('/booked', async (req, res) => {
	let booking_info = await Reservation.findOne({
		attributes: ['check_in', 'check_out', 'adults', 'child', 'room'],
		raw: true
	})
	res.render('Booked', { booking_info });
});

module.exports = router;