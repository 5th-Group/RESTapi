// Dependencies
const express = require("express");
const router = express.Router();
const Publisher = require("../models/publisher");
const Country = require("../models/countries");

// GET all
router.get("/", async (req, res) => {
    let searchDetail;
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.query.name, "i");
    }
    try {
        const publishers = await Publisher.find(searchDetail);
        res.render("publishers/index", {
            publishers: publishers,
            searchDetail: req.query,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        res.render("publishers/index", { errorMessage: err.message });
    }
});

// GET new page
router.get("/new", async (req, res) => {
    try {
        const publisher = await new Publisher();
        const countries = await Country.find({});
        res.render("publishers/new", {
            publisher: publisher,
            countries: countries,
        });
    } catch (err) {
        res.send(err.message);
    }
});

// GET one
router.get("/:id", getPublisher, async (req, res) => {
    res.render("publishers/detail", { publisher: res.publisher });
});

// POST
router.post("/new", async (req, res) => {
    const contact = {
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        twitter: req.body.twitter,
        facebook: req.body.facebook,
        email: req.body.email,
    };
    const publisher = new Publisher({
        name: req.body.name,
        contact: contact,
        origin: req.body.country,
    });
    try {
        await publisher.save();
        res.redirect("/publishers");
    } catch {
        res.render("publishers/new", {
            errorMessage: "Something is wrong",
            publisher: publisher,
        });
    }
});

// Reusable function to get one
async function getPublisher(req, res, next) {
    let publisher;
    try {
        publisher = Publisher.findById(req.params.id);
        if (publisher == null) {
            res.status(404).json({ message: err.message });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.publisher = publisher;
    next();
}

module.exports = router;
