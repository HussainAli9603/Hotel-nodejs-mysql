const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
const TransactionService = require("../../services/TransactionService");

router.get("/", ensureAuthenticated, async (req, res) => {
    const transactions = await TransactionService.getTransactionsConsumer(req.user.id);
    res.render("transaction/index", {transactions});
});

module.exports = router;