const express = require('express');
const router = express.Router();
const flashMessage = require('../../../helpers/messenger');
const ensureAuthenticatedAdmin = require('../../../helpers/authAdmin');
const TransactionService = require("../../../services/TransactionService");

// todo
router.get("/", ensureAuthenticatedAdmin, async (req, res) => {
    const transactions = await TransactionService.getTransactions(req.user.id);
    res.render("admin/transaction/index", {transactions});
});

module.exports = router;