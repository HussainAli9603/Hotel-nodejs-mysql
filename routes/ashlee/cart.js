const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require("../../helpers/auth");
const TempProduct = require("../../models/TempProduct");
const Room = require("../../models/Room");
const Cart = require("../../models/Cart");
const db = require('../../config/DBConfig');
const {QueryTypes} = require('sequelize');
const CartProduct = require("../../models/CartProduct");
const CartService = require("../../services/CartService");

STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY

router.get("/", ensureAuthenticated, async (req, res) => {
    let carts = await db.query(`SELECT id FROM Carts
                                 WHERE UserId = "${req.user.id}" AND isPaid = "0"
                                 LIMIT 1`, {type: QueryTypes.SELECT});
    let cartId = (carts.length > 0) ? carts[0].id : null;
    if (cartId == null) {
        let newCart = await Cart.create({UserId: req.user.id});
        cartId = newCart.id;
    }

    // Get all products inside this cart, if any
    let cartItems = await db.query(`SELECT *, quantity * price AS "totalPrice" FROM CartProducts
//                                    JOIN TempProducts Products ON CartProducts.TempProductId = Products.id
                                   JOIN Rooms r ON CartProducts.RoomId = r.id
                                   WHERE CartId = ${cartId}`, {type: QueryTypes.SELECT});

    // Get cart subtotal and total
    let subtotal = cartItems.map(x => x.totalPrice).reduce((a, b) => a + b, 0);

    res.render("cart/index", {cartItems, subtotal});
});

router.get("/add/:id", ensureAuthenticated, async (req, res) => {
    let cart = await Cart.findOne({where: {UserId: req.user.id, isPaid: 0}});
    if (cart == null) {
        cart = await Cart.create({UserId: req.user.id});
    }
    // Check if this product is already in the cart, and increment the value if it is so.
    const checkProduct = await CartProduct.findOne({where: {CartId: cart.id, TempProductId: req.params.id}});
    if (checkProduct != null) {
        res.redirect(`/cart/addOne/${req.params.id}`);
        return;
    }

    // let tempProduct = await TempProduct.findByPk(req.params.id);
    let room = await Room.findByPk(req.params.id);
    let cartProduct = await CartProduct.create({
        CartId: cart.id,
        TempProductId: tempProduct.id,
        quantity: 1,
    });
    flashMessage(res, "success", "Product added to cart!");
    res.redirect("/cart");
});

// This endpoint is used to increase the quantity by 1 of a product in the cart.
// Only to be used on the cart page; i.e. item already in cart
router.get("/addOne/:id", ensureAuthenticated, async (req, res) => {
    let cart = await Cart.findOne({where: {UserId: req.user.id, isPaid: 0}});
    let cartProduct = await CartProduct.findOne({
        where: {TempProductId: req.params.id, CartId: cart.id}
    });
    ++cartProduct.quantity;
    await cartProduct.save();
    flashMessage(res, "success", "Successfully added 1 item to cart");

    res.redirect("/cart");
});

// This endpoint is used to remove the quantity by 1 of a product in the cart.
// Only to be used on the cart page; i.e. item already in cart
router.get("/removeOne/:id", ensureAuthenticated, async (req, res) => {
    let cart = await Cart.findOne({where: {UserId: req.user.id, isPaid: 0}});
    let cartProduct = await CartProduct.findOne({
        where: {TempProductId: req.params.id, CartId: cart.id}
    });
    --cartProduct.quantity;
    if (cartProduct.quantity == 0) {
        await cartProduct.destroy();
        flashMessage(res, "success", "Item removed from cart");
    } else {
        await cartProduct.save();
        flashMessage(res, "success", "Item removed from cart");
    }

    res.redirect("/cart");
});



// This endpoint is used to remove ALL of one type of product from the cart.
router.get("/remove/:id", ensureAuthenticated, async (req, res) => {
    let cart = await Cart.findOne({where: {UserId: req.user.id, isPaid: 0}});
    let cartProduct = await CartProduct.findOne({
        where: {TempProductId: req.params.id, CartId: cart.id}
    });
    await cartProduct.destroy();
    flashMessage(res, "success", "Item removed from cart");

    res.redirect("/cart");
});

// Step 1, select payment mode
router.get("/checkout", ensureAuthenticated, async (req, res) => {
    const step = 1;
    const amountDue = await CartService.getUnpaidTotal(req.user.id);
    res.render("cart/checkout", {step, amountDue});
});

// Credit card payment: enter details
router.get("/checkout/credit", ensureAuthenticated, async (req, res) => {
    const step = 2;
    const amountDue = await CartService.getUnpaidTotal(req.user.id);
    res.render("cart/checkout", {key: STRIPE_PUBLISHABLE_KEY, step, amountDue});
});

// Credit card payment: POST after step 2
router.post("/checkout/credit", ensureAuthenticated, async (req, res) => {
    // TODO: Validation - no need to record card details as handled by external payment processor (Stripe)
    // await CartService.pay(req.user.id, req.body.stripeEmail, req.body.stripeToken);
    await CartService.pay(req.user.id);
    res.redirect("/cart/checkout/confirm/" + req.body.amount);
});

// Thank you page
router.get("/checkout/confirm/:amount", ensureAuthenticated, async (req, res) => {
    const step = 3;
    // Get most recent payment amount
    // const paymentQueryStr = `SELECT SUM(p.price * cp.quantity) AS "totalAmount"
    //                          FROM Carts c
    //                          JOIN CartProducts cp ON c.id = cp.CartId
    //                          JOIN TempProducts p ON cp.TempProductId = p.id
    //                          WHERE c.UserId = "${req.user.id}" AND c.isPaid = "1"
    //                          ORDER BY paidDate DESC LIMIT 1
    //                          `;
    // const paymentAmountResult = await db.query(paymentQueryStr, {type: QueryTypes.SELECT});
    // const paymentAmount = paymentAmountResult[0].totalAmount;  // can't put it all into one line or it won't work???
    const paymentAmount = req.params.amount;
    console.log(paymentAmount);

    // Get points (after integration)
    res.render("cart/checkout", {step, paymentAmount});
});

module.exports = router;