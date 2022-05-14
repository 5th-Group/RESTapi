// Dependencies
const express = require("express");
const router = express.Router();
const Country = require("../models/countries");

// GET all
router.get("/", async (req, res) => {
    let user = req.user != null ? req.user : undefined

    let searchDetail = {};
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.query.name, "i");
    }
    try {
        const countries = await Country.find(searchDetail);

        if (req.query.json) {
            res.status(200).send(countries)
        } else {
            res.render("countries/index", {
                countries: countries,
                searchDetail: req.body,
                user: user,
            });
        }
    } catch (err) {
        console.log(err.message);
    }
});

// GET new
router.get("/new", (req, res) => {
    let user;

    if (typeof req.user !== 'undefined') {
        user = req.user
    }

    const country = new Country();
    res.render("countries/new", { 
        country: country,
        user: user,
    });
});

// POST
router.post("/new", async (req, res) => {
    let user;

    if (typeof req.user !== 'undefined') {
        user = req.user
    }

    const country = new Country({
        name: req.body.name,
        code: req.body.code,
    });
    try {
        const newCountry = await country.save();
        res.redirect("/countries");
    } catch (err) {
        res.render("countries/new", {
            country: country,
            user: user,
            errorMessage: err.message,
        });
    }
});

module.exports = router;
