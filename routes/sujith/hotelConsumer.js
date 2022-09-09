const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require("../../helpers/auth");
const Hotel = require("../../models/Hotel");

// List all hotels
router.get("/", ensureAuthenticated, async (req, res) => {
    const hotels = await Hotel.findAll();
    res.render("hotel/consumer/listHotel", { products: hotels });
});

module.exports = router;