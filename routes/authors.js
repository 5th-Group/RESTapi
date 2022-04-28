const express = require("express");
const router = express.Router();
const Author = require("../models/authors");

// Getting all
router.get("/", async (req, res) => {
    let searchDetail = {};
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.query.name, "i");
    }
    try {
        const authors = await Author.find(searchDetail);
        res.render("authors/index", {
            authors: authors,
            searchDetail: req.query,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET creating page
router.get("/new", (req, res) => {
    res.render("authors/new", {
        author: new Author(),
        isAuthenticated: req.isAuthenticated(),
    });
});

// GET one
router.get("/:id", getAuthor, async (req, res) => {
    res.render("authors/detail", {
        author: res.author,
        isAuthenticated: req.isAuthenticated(),
    });
});

// Updating one
router.get("/:id/edit", getAuthor, async (req, res) => {
    res.render("authors/edit", {
        author: res.author,
        isAuthenticated: req.isAuthenticated(),
    });
});

// Creating one
router.post("/new", async (req, res) => {
    const author = new Author({
        firstName: req.body.fname,
        middleName: req.body.midname,
        lastName: req.body.lname,
        origin: req.body.origin,
        gender: req.body.gender,
        dateOfBirth: new Date(req.body.dateOfBirth),
        biography: req.body.biography,
    });
    try {
        const newAuthor = await author.save();
        res.redirect("/authors");
    } catch (err) {
        res.render("authors/new", {
            author: author,
            errorMessage: err.message,
            isAuthenticated: req.isAuthenticated(),
        });
    }
});

// UPDATING ONE
router.put("/:id/edit", getAuthor, async (req, res) => {
    let author;
    try {
        author = res.author;
        (author.firstName = req.body.fname),
            (author.middleName = req.body.midname),
            (author.lastName = req.body.lname),
            (author.origin = req.body.origin),
            (author.dateOfBirth = new Date(req.body.dateOfBirth)),
            (author.biography = req.body.biography);
        await author.save();
        res.redirect("/authors");
    } catch {
        if (author == null) {
            res.redirect("/");
        } else {
            res.render("authors/edit", {
                author: author,
                errorMessage: "Error",
                isAuthenticated: req.isAuthenticated(),
            });
        }
    }
});

async function getAuthor(req, res, next) {
    let author;
    try {
        author = await Author.findById(req.params.id);
        if (author == null) {
            res.status(404).send({ message: "Can't find that author" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.author = author;
    next();
}

// Deleting  one
router.delete("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.deleteOne();
        res.redirect("/authors");
    } catch (err) {
        res.send(err.message);
    }
});

module.exports = router;
