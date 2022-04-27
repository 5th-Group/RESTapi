// Dependencies
const express = require("express");
const router = express.Router();
const Country = require("../models/countries");

// GET all
router.get("/", async (req, res) => {
    let searchDetail = {};
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.query.name, "i");
    }
    try {
        const countries = await Country.find(searchDetail);
        res.render("countries/index", {
            countries: countries,
            searchDetail: req.body,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        console.log(err.message);
    }
});

// GET new
router.get("/new", (req, res) => {
    const country = new Country();
    res.render("countries/new", { country: country });
});

// POST
router.post("/new", async (req, res) => {
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
            errorMessage: err.message,
        });
    }
});

module.exports = router;
