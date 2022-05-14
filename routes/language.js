// Dependencies
const express = require("express");
const router = express.Router();
const Language = require("../models/language");

// GET ALL
router.get("/", async (req, res) => {
    const user = req.user != null ? req.user : undefined

    let searchDetail = {};
    if (req.query.name != null && req.query.name != "") {
        searchDetail.name = new RegExp(req.body.name, "i");
    }

    try {
        const languages = await Language.find(searchDetail);
        if (req.query.json) {
            res.status(200).send(languages)
        } else {
            res.render("languages/index", {
                languages: languages,
                searchDetail: req.body,
                user: user,
            });
        }
    } catch (err) {
        res.send(err)
    }
});

// GET NEW
router.get("/new", async (req, res) => {
    try {
        const language = await new Language();
        res.render("languages/new", {
            language: language,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        console.log(err.message);
    }
});

// GET ONE
router.get("/:id", async (req, res) => {
    try {
        let language = await Language.findById(req.params.id);
        res.send(language);
    } catch (err) {
        res.send(err.message);
    }
});

// POST
router.post("/new", async (req, res) => {
    const language = await new Language({
        name: req.body.name,
        code: req.body.code,
    });
    try {
        await language.save();
        res.redirect("/languages");
    } catch (err) {
        res.render("languages/new", {
            language: req.body,
            errorMessage: err.message,
        });
    }
});

module.exports = router;
