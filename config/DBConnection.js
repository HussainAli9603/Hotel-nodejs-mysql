const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const UserType = require('../models/UserType');
const Chat = require('../models/Chat');
const Video = require('../models/Video');
const Cart = require('../models/Cart');
const TempProduct = require('../models/TempProduct');
const CartProduct = require('../models/CartProduct');
const Rewards = require('../models/Rewards');
const Promotions = require('../models/Promotions');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const Room = require('../models/Room');

// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
  mySQLDB.authenticate()
      .then(() => {
        console.log('Database connected');
        UserType.hasMany(User);
        User.belongsTo(UserType);
        Chat.belongsTo(User, {as: "sender"});  // FK: senderId
        Chat.belongsTo(User, {as: "recipient"})  // FK: recipientId
        User.hasMany(Cart);
        Cart.belongsTo(User);
        Cart.hasMany(CartProduct);
        CartProduct.belongsTo(Cart);
        // TempProduct.hasMany(CartProduct);
        // CartProduct.belongsTo(TempProduct);

        Room.hasMany(CartProduct);
        CartProduct.belongsTo(Room);

        User.hasMany(TempProduct);
        TempProduct.belongsTo(User);
        User.hasMany(Rewards);
        Rewards.belongsTo(User);
        User.hasMany(Promotions);
        Promotions.belongsTo(User);

        /*
        Defines the relationship where a user has many videos.
        The primary key from user will be a foreign key in video.
        */
        User.hasMany(Video);
        Video.belongsTo(User);
        User.hasMany(Event);
        Event.belongsTo(User);
        User.hasMany(Feedback);
        Feedback.belongsTo(User);
        User.hasOne(Hotel);
        Hotel.belongsTo(User);
        Hotel.hasMany(Room);
        Room.belongsTo(Hotel);
        mySQLDB.sync({
          force: drop
        });
      })
      .catch(err => console.log(err));
};

module.exports = {setUpDB};