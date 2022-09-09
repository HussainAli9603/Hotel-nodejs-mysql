const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require("../../helpers/auth");
const Room = require("../../models/Room");

// List all hotels
router.get("/:id", ensureAuthenticated, async (req, res) => {
    const rooms = await Room.findAll({where: {hotelId: req.params.id}});
    res.render("room/consumer/listRoom", { products: rooms });
});

module.exports = router;
