// Dependencies
const express = require("express");
const router = express.Router();
const BookGenre = require("../models/bookGenre");

// GET ALL
router.get("/", async (req, res) => {
    let user;

    if (typeof req.user !== 'undefined') {
        user = req.user
    }

    let searchDetail = {};
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.body.name, "i");
    }
    try {
        const bookGenres = await BookGenre.find(searchDetail);


        res.render("books/genres/index", {
            bookGenres: bookGenres,
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

    if (typeof req.user !== 'undefined') {
        user = req.user
    }
    
    try {
        const bookGenre = await new BookGenre();
        res.render("books/genres/new", {
            bookGenre: bookGenre,
            user: user,
        });
    } catch (err) {
        console.log(err.message);
    }
});

// POST
router.post("/new", async (req, res) => {
    let user;

    if (typeof req.user !== 'undefined') {
        user = req.user
    }

    const bookGenre = await new BookGenre({
        name: req.body.name,
    });
    try {
        await bookGenre.save();
        res.redirect("/books/genres");
    } catch (err) {
        res.render("books/genres/new", {
            bookGenre: req.body,
            errorMessage: err.message,
            user: user,
        });
    }
});

module.exports = router;
