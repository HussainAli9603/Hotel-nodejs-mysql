const express = require('express');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const User = require('../../models/User');
const UserType = require('../../models/UserType');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Required for email verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const ensureAuthenticated = require("../../helpers/auth");
const AccountService = require("../../services/AccountService");
const ChatService = require("../../services/ChatService");

function sendEmail(toEmail, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `Hovago <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Verify Hovago Account',
        html: `Thank you registering with Hovago.<br><br> Please <a href=\"${url}"><strong>verify</strong></a> your account.`
    };

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

router.get('/login', async (req, res) => {
    // hacky workaround for logging into admin account not redirecting properly
    if (req.user) {
        if (req.user.UserTypeId === res.locals.CONSUMER_TYPE_ID) {
            res.redirect("");
            return;
        } else if (req.user.UserTypeId === res.locals.ADMIN_TYPE_ID) {
            if (await ChatService.userHasUnreadChats(req.user.id))
                flashMessage(res, "info", "You have unread chat messages.");

            res.redirect("/admin/transaction");
            return;
        }
    }
    res.render('user/login');
});

router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async function (req, res) {
    let {name, email, password, password2, tnc, admin} = req.body;

    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password !== password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (tnc === false) {
        flashMessage(res, "error", "Please accept the terms and conditions to continue");
        isValid = false;
    }

    if (!isValid) {
        res.render('user/register', {
            name, email
        });
        return;
    }

    let userTypeConsumer = await UserType.findOne({where: {description: "Consumer"}});
    let userTypeAdmin = await UserType.findOne({where: {description: "Admin"}});

    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({where: {email: email}});
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('user/register', {
                name, email
            });
        } else {
            // Create new user record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({name, email, password: hash, verified: 0, UserTypeId: (admin) ? userTypeAdmin.id : userTypeConsumer.id});
            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            sendEmail(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', user.email + ' registered successfully');
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    res.redirect('/');
                });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/verify/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;

    try {
        // Check if user is found
        let user = await User.findByPk(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        if (user.verified) {
            flashMessage(res, 'info', 'User already verified');
            res.redirect('/user/login');
            return;
        }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData !== user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }

        let result = await User.update(
            {verified: 1},
            {where: {id: user.id}});
        console.log(result[0] + ' user updated');
        flashMessage(res, 'success', user.email + ' verified. Please login');
        res.redirect('/user/login');
    } catch (err) {
        console.log(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/user/afterLogin',
        // Failure redirect URL
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

router.get("/afterLogin", ensureAuthenticated, async (req, res) => {
    // Load and flash unread chats warning if there exists unread chats
    // console.log(req.user);
    // (async (req, res) => {
    //     if (await ChatService.userHasUnreadChats(req.user.id))
    //         flashMessage(res, "info", "You have unread chat messages.");
    // })(req, res);

    if (await ChatService.userHasUnreadChats(req.user.id))
        flashMessage(res, "info", "You have unread chat messages.");

    if (req.user.UserTypeId === res.locals.CONSUMER_TYPE_ID) {
        res.redirect("/video/listVideos");  // successRedirect
    } else if (req.user.UserTypeId === res.locals.ADMIN_TYPE_ID) {
        res.redirect("/admin/transaction");
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


/*
 * Update account section
 */
router.post("/update", ensureAuthenticated, async (req, res) => {
    let prevUrl = req.header("Referer") || "/";
    let {currentPw, name, emailAddress, newPassword, confirmPassword} = req.body;

    if (!bcrypt.compareSync(currentPw, req.user.password)) {
        flashMessage(res, "error", "Current password does not match");
        res.redirect(prevUrl);
        return;
    }

    let changed = false;
    if (name !== "" && name !== req.user.name) {
        req.user.name = name;
        await req.user.save();
        flashMessage(res, "success", "Successfully updated name");
        changed = true;
    }

    if (emailAddress !== "" && emailAddress !== req.user.email) {
        req.user.email = emailAddress;
        await req.user.save();
        flashMessage(res, "success", "Successfully updated email");
        changed = true;
    }

    if (newPassword !== "" && confirmPassword != null) {
        if (newPassword !== confirmPassword) {
            flashMessage(res, "error", "New password and confirm password do not match");
            res.redirect(prevUrl);
            return;
        }

        if (newPassword.length < 6) {
            flashMessage(res, "error", "New password must be at least 6 characters in length");
            res.redirect(prevUrl);
            return;
        }

        await AccountService.updateUserPasswordHash(req.user, newPassword, () => {
            flashMessage(res, "success", "Successfully updated password");
            changed = true;
        });
    }

    if (!changed) {
        flashMessage(res, "info", "No changes made to your account");
    }

    res.redirect(prevUrl);
});

// API Endpoint to be used for chat system to retrieve list of usernames and their IDs
router.get("/api/getUsers", ensureAuthenticated, async (req, res) => {
    let users = await User.findAll({
        attributes: ["id", "name"]
    });
    console.log(users);
    res.send(users);
});

module.exports = router;
