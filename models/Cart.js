// Ashlee
/* A Cart contains several products, and there should only be one unpaid cart at any point in time.
 * A Cart is associated with a user, and is created when the user 'adds a new item to cart'
 * If an unpaid cart is deleted, the cart entry shall be deleted -Ashlee
 */
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Cart = db.define('Cart', {
    isPaid: {type: Sequelize.BOOLEAN, defaultValue: false},
    paidDate: {type: Sequelize.DATE}
});

module.exports = Cart;