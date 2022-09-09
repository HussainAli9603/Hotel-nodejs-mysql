const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require("../../helpers/auth");
const TempProduct = require("../../models/TempProduct");
const db = require("../../config/DBConfig");
const {QueryTypes} = require("sequelize");

router.get("/", ensureAuthenticated, async (req, res) => {
    const products = await db.query(`SELECT * FROM TempProducts`, { type: QueryTypes.SELECT });
    res.render("tempCatalog/index", {products});
});

module.exports = router;