// Dependencies
const express = require("express");
const router = express.Router();
const brcypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/users");
const Country = require("../models/countries");
const jwt = require("jsonwebtoken");

const initializePassport = require("../auth/auth");

/* GET home page. */
router.get("/", (req, res) => {
    res.redirect("/books");
});

// GET login page
router.get("/login", function (req, res) {
    res.render("authentication/login");
});

// GET register page
router.get("/register", async (req, res) => {
    const countries = await Country.find({});
    const user = await new User();
    res.render("authentication/register", {
        user: user,
        countries: countries,
    });
});

// POST login
router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error(err.message);
                return res.redirect("/login");
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = { _id: user._id, username: user.username };
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

    const user = new User({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.fname,
        lastName: req.body.lname,
        gender: req.body.gender,
        address: req.body.address,
        email: req.body.email,
        country: req.body.country,
        phoneNumber: req.body.phonenum,
    });
    try {
        await user.save();
        res.redirect("/");
    } catch (err) {
        res.render("authentication/register", {
            user: req.body,
            errorMessage: err.message,
        });
    }
});

module.exports = router;
