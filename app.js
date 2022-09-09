/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const {engine} = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
const helpers = require('./helpers/handlebars');
app.engine('handlebars', engine({
    helpers: helpers,
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main' // Specify default template views/layout/main.handlebar
}));
app.set('view engine', 'handlebars');

// Express middleware to parse HTTP body in order to read HTTP data
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Library to use MySQL to store session objects 
const MySQLStore = require('express-mysql-session');
var options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    clearExpired: true,
    // The maximum age of a valid session; milliseconds:
    expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 1800000 // 30 min
};

// To store session information. By default it is stored as a cookie on browser
app.use(session({
    secret: process.env.APP_SECRET,
    store: new MySQLStore(options),
    resave: false,
    saveUninitialized: false,
}));

// Bring in database connection 
const DBConnection = require('./config/DBConnection');
// Connects to MySQL database 
DBConnection.setUpDB(process.env.DB_RESET == 1); // To set up database with new tables (true)

// ASHLEE: Create enum tables
const DBInitEnums = require("./config/DBInitEnums")
DBInitEnums.initialize().then(() => console.log("Initialized enum tables"));

// Messaging library
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
app.use(flashMessenger.middleware);

// Passport Config 
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);

// Initilize Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// Place to define global variables
// const consumerTypeId = await DBInitEnums.getConsumerTypeId();
// const adminTypeId = await DBInitEnums.getAdminTypeId();

app.use(function (req, res, next) {
    res.locals.messages = req.flash('message');
    res.locals.errors = req.flash('error');
    res.locals.user = req.user || null;
    // res.locals.CONSUMER_TYPE_ID = consumerTypeId;
    // res.locals.ADMIN_TYPE_ID = adminTypeId;
    res.locals.CONSUMER_TYPE_ID = 1;
    res.locals.ADMIN_TYPE_ID = 2;
    res.locals.rewardsConsumer = req.rewardsConsumer
    next();
});

// mainRoute is declared to point to routes/main.js
const mainRoute = require('./routes/main');
// const userRoute = require('./routes/user');
const videoRoute = require('./routes/video');

// ASHLEE
const userRoute = require("./routes/ashlee/user");
const chatRoute = require("./routes/ashlee/chat");
const cartRoute = require("./routes/ashlee/cart");
const tempCatalogRoute = require("./routes/ashlee/tempCatalog");
const consumerTransactionRoute = require("./routes/ashlee/transaction");

// ASHLEE: admin section
const adminTransactionRoute = require("./routes/ashlee/admin/transaction");

// SAMMI
const rewardsConsumerRoute = require("./routes/sammi/rewardsConsumer");
const promotionConsumerRoute = require("./routes/sammi/promotionsConsumer");
const pastRedemptionConsumerRoute = require("./routes/sammi/pastRedemption");
//SAMMI: admin section
const rewardsAdminRoute = require("./routes/sammi/rewardsAdmin");
const promotionsAdminRoute = require("./routes/sammi/promotionsAdmin");

//SUJITH
const hotelRoute = require('./routes/sujith/hotel');
const roomRoute = require('./routes/sujith/room');
const hotelConsumerRoute = require("./routes/sujith/hotelConsumer");
const roomConsumerRoute = require("./routes/sujith/roomConsumer");

// VERNON
const eventUserRoute = require("./routes/vernon/eventsUser");
const feedbackUserRoute = require("./routes/vernon/feedbackUser");
// VERNON: admin section
const adminEventRoute = require("./routes/vernon/admin/eventsAdmin");

// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use('/', mainRoute);
// app.use('/user', userRoute);
app.use('/video', videoRoute);

// ASHLEE
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/tempCatalog", tempCatalogRoute);
app.use("/cart", cartRoute);
app.use("/transaction", consumerTransactionRoute);

// ASHLEE: admin section
app.use("/admin/transaction", adminTransactionRoute);
//SAMMI
app.use("/rewards", rewardsConsumerRoute);
app.use("/userPromotions", promotionConsumerRoute);
app.use("/pastRedemption", pastRedemptionConsumerRoute);

// SAMMI : admin section
app.use("/admin/rewards", rewardsAdminRoute);
app.use("/admin/adminPromotions", promotionsAdminRoute);

//SUJITH
app.use("/admin/hotel", hotelRoute);
app.use("/admin/hotel/room", roomRoute);
app.use("/hotel", hotelConsumerRoute);
app.use("/hotel/room", roomConsumerRoute);

// VERNON
app.use("/events", eventUserRoute);
app.use("/reviews", feedbackUserRoute);
// VERNON: admin section
app.use("/admin/events", adminEventRoute);

/*
* Creates a port for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = process.env.PORT;

// Starts the server and listen to port
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});