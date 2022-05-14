// Dependencies
const express = require("express");
const router = express.Router();
const BookCover = require("../models/bookCover");

// GET ALL
router.get("/", async (req, res) => {
    const user = req.user != null ? req.user : undefined

    let searchDetail = {};
    if (req.query.type != null && req.query.type != "") {
        searchDetail.type = new RegExp(req.body.type, "i");
    }
    try {
        const bookCovers = await BookCover.find(searchDetail);

        if (req.query.json) {
            res.status(200).send(bookCovers)
        } else {
            res.render("bookCovers/index", {
                bookCovers: bookCovers,
                searchDetail: req.body,
                user: user,
            });
        }

    } catch (err) {
        console.log(err.message);
    }
});

// GET NEW
router.get("/new", async (req, res) => {
    const user = req.user != null ? req.user : undefined

    try {
        const bookCover = await new BookCover();

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
    const user = req.user != null ? req.user : undefined

    const bookCover = await new BookCover({
        type: req.body.type,
    });

    try {
        await bookCover.save();

        res.redirect("/covers");

    } catch (err) {

        res.render("bookCovers/new", {
            bookCover: req.body,
            errorMessage: err.message,
            user: user,
        });
    }
});

module.exports = router;
