const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const TempProduct = db.define("TempProduct", {
    name: {type: Sequelize.STRING(100)},
    description: {type: Sequelize.STRING(1000)},
    price: {type: Sequelize.FLOAT},
    image: {type: Sequelize.STRING(1000)},
    category: {type: Sequelize.STRING(100)}
});

module.exports = TempProduct;