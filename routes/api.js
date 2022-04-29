//Dependencies
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Product = require("../models/product");
const passport = require("passport");
require("../auth/auth");

router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
            .lean()
            .populate({
                path: "detail",
                populate: { path: "author genre language publisher" },
                select: "title pageCount description author language genre coverType createdAt publishDate publisher isbn",
            });
        const booksImg = await Book.find().select("image imageType");
        for (i = 0; i < booksImg.length; i++) {
            products[i].detail.icon = booksImg[i].iconImgPath;
        }
        res.json(products);
    } catch (err) {
        res.send(err);
    }
});

// router.get("/update", async (req, res) => {
//     try {
//         const books = await Book.find({});
//         books.forEach(async (book) => {
//             let product = await new Product();
//             product.detail = book.id;
//             await product.save();
//         });
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error(info.message);
                return res.send(error.message);
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                res.send(user);
            });
        } catch (err) {
            return next(err.message);
        }
    })(req, res, next);
});

module.exports = router;
