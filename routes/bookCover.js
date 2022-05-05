// Dependencies
const express = require("express");
const router = express.Router();
const BookCover = require("../models/bookCover");

// GET ALL
router.get("/", async (req, res) => {
    let searchDetail = {};
    let user;
    if (req.query.type != null && req.query.type != "") {
        searchDetail.type = new RegExp(req.body.type, "i");
    }
    try {
        const bookCovers = await BookCover.find(searchDetail);
        if (typeof req.user !== 'undefined') {
            user = req.user
        }
        res.render("bookCovers/index", {
            bookCovers: bookCovers,
            searchDetail: req.body,
            user: user,
        });
    } catch (err) {
        console.log(err.message);
    }
});

// GET NEW
router.get("/new", async (req, res) => {
    let user;
    try {
        const bookCover = await new BookCover();
        
        if (typeof req.user !== 'undefined') {
            user = req.user
        }

        res.render("bookCovers/new", {
            bookCover: bookCover,
            user: user,
        });
    } catch (err) {
        console.log(err.message);
    }
});

// POST
router.post("/new", async (req, res) => {
    let user;
    const bookCover = await new BookCover({
        type: req.body.type,
    });
    try {

        await bookCover.save();
        res.redirect("/covers");
    } catch (err) {

        if (typeof req.user !== 'undefined') {
            user = req.user
        }

        res.render("bookCovers/new", {
            bookCover: req.body,
            errorMessage: err.message,
            user: user,
        });
    }
});

module.exports = router;
