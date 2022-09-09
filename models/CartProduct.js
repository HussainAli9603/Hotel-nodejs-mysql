const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const CartProduct = db.define("CartProduct", {
    quantity: {type: Sequelize.INTEGER, defaultValue: 1}
});

module.exports = CartProduct;