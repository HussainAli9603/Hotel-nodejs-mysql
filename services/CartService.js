const {QueryTypes} = require("sequelize");
const db = require("../config/DBConfig");
const Cart = require("../models/Cart");
const Stripe = require("stripe");

STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY

const stripe = Stripe(STRIPE_SECRET_KEY);

const getUnpaidTotal = async (userId) => {
    let carts = await db.query(`SELECT id FROM Carts
                                 WHERE UserId = "${userId}" AND isPaid = "0"
                                 LIMIT 1`, {type: QueryTypes.SELECT});
    let cartId = (carts.length > 0) ? carts[0].id : null;
    if (cartId == null) {
        let newCart = await Cart.create({UserId: userId});
        cartId = newCart.id;
    }
    // Get all products inside this cart, if any
    let cartItems = await db.query(`SELECT *, quantity * price AS "totalPrice" FROM CartProducts
                                   JOIN TempProducts Products ON CartProducts.TempProductId = Products.id
                                   WHERE CartId = ${cartId}`, {type: QueryTypes.SELECT});

    // Get cart subtotal and total
    let subtotal = cartItems.map(x => x.totalPrice).reduce((a, b) => a + b, 0);
    return subtotal;
};

const pay = async (userId) => {
    let cart = await Cart.findOne({where: {UserId: userId, isPaid: 0}});
    // let customer_name = (await db.query(`SELECT name FROM Users WHERE id = "${userId}"`, {type: QueryTypes.SELECT}))[0].name;
    try {
        // stripe.customers.create({
        //     email: stripeEmail,
        //     source: stripeToken,
        // }).then(customer => {
        //     return stripe.charges.create({
        //         amount: getUnpaidTotal(userId),
        //         description: 'Hovago Product',
        //         currency: 'sgd',
        //         customer: customer.id
        //     })
        // }).then(charge => true);
        cart.isPaid = 1;
        cart.paidDate = new Date();
        await cart.save();
    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = {getUnpaidTotal, pay};