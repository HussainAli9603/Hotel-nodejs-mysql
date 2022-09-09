const db = require('../config/DBConfig');

// For admin side - returns the date, personName, itemName, quantity, totalPaid
const getTransactions = async (companyUserId) => {
    const queryString = `SELECT c.paidDate date, u.name personName, p.name itemName, cp.quantity quantity, cp.quantity * p.price totalPaid
                         FROM Carts c
                         INNER JOIN CartProducts cp ON c.id = cp.CartId
                         INNER JOIN TempProducts p ON cp.TempProductId = p.id
                         INNER JOIN Users u ON c.UserId = u.id
                         WHERE c.isPaid = 1 AND
                               p.UserId = ${companyUserId}
                         ORDER BY c.paidDate DESC;
                        `;
    const queryResults = await db.query(queryString, {type: db.QueryTypes.SELECT});
    return queryResults;
};

const getTransactionsConsumer = async (consumerUserId) => {
    const queryString = `SELECT c.paidDate date, b.name businessName, p.name itemName, cp.quantity quantity, cp.quantity * p.price totalPaid
                         FROM Carts c
                         INNER JOIN CartProducts cp ON c.id = cp.CartId
                         INNER JOIN TempProducts p ON cp.TempProductId = p.id
                         INNER JOIN Users b ON p.UserId = b.id
                         WHERE c.isPaid = 1 AND
                               c.UserId = ${consumerUserId}
                         ORDER BY c.paidDate DESC;
                        `;
    const queryResults = await db.query(queryString, {type: db.QueryTypes.SELECT});
    return queryResults;
};

module.exports = {getTransactions, getTransactionsConsumer};