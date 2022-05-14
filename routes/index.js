// Dependencies
const express = require("express");
const router = express.Router();
const brcypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/users");
const Country = require("../models/countries");
const authenticatedOrGuest = require("../auth/authenticatedOrGuest");
const jwt = require("jsonwebtoken");

/* GET home page. */
router.get("/", (req, res) => {
    res.redirect("/books");
});

// GET login page
router.get("/login", authenticatedOrGuest, checkNotAuthenticated, function (req, res) {
    res.render("authentication/login");
});

// GET register page
router.get("/register", authenticatedOrGuest, checkNotAuthenticated ,async (req, res) => {

    try {
        const countries = await Country.find({});
        const registerUser = await new User();
    
        res.render("authentication/register", {
            registerUser: registerUser,
            countries: countries,
        });
    } catch (err) {
        res.send(err)
    }
});

// GET logout page
router.get("/logout", async (req, res) => {
    res.clearCookie("access_token");
    res.redirect("/");
});

// POST login
router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error(info.message);
                return res.render("authentication/login", {
                    errorMessage: error.message,
                    isAuthenticated: req.isAuthenticated(),
                });
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                };
                const token = jwt.sign({ user: body }, "TOP_SECRET");
                res.cookie("access_token", token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true,
                });

                res.redirect("/");
            });
        } catch (err) {
            return next(err.message);
        }
    })(req, res, next);
});

// POST Register
router.post("/register", async (req, res) => {
    const hashedPassword = await brcypt.hash(req.body.password, 10);

    const address = [{
        location: req.body.location,
        type: req.body.type,
    }]

    const registerUser = new User({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.fname,
        lastName: req.body.lname,
        gender: req.body.gender,
        address: address,
        email: req.body.email,
        country: req.body.country,
        phoneNumber: req.body.phonenum,
    });

    try {
        await user.save();
        res.redirect("/");

    } catch (err) {
        const countries = await Country.find({});

        res.render("authentication/register", {
            countries: countries,
            errorMessage: err.message,
            registerUser: registerUser,
            user: user,
        });
    }
});


async function checkAuthenticated(req, res, next) {
    if (!req.user) {
        return res.redirect("/")
    }

    next()
}

async function checkNotAuthenticated(req, res, next) {
    if (req.user) {
        return res.redirect("/")
    }

    next()
}

module.exports = router;
