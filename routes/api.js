//Dependencies
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Product = require("../models/product");
const passport = require("passport");
require("../auth/auth");

router.get("/", async (req, res) => {
    try {
        const products = await Product.find({})
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher",  },
            select: "-image -imageType",
        })
        .lean()


        const booksImg = await Book.find({})
        .select("image imageType")
        .exec((err, booksImg) => {
            if (err) new Error(err)
            products.forEach((product, index )=> {
                product.icon = booksImg[index].iconImgPath
            })

            res.send(products)
        })


        // .exec(async (err, products) => {
        //     const booksImg = await Book.find({}).select("image imageType");
        //     for (i = 0; i < booksImg.length; i++) {
        //         products[i].detail.icon = booksImg[i].iconImgPath
        //     }
        // })




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

// POST register
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
        res.status(201).send({
            infoMessage: "The account has been registered successfully.",
        });
    } catch (err) {
        res.send({ errorMessage: err.message });
    }
});

// POST login
router.post("/login", async (req, res, next) => {
    passport.authenticate("login", async (err, user, info) => {
        try {
            if (err || !user) {
                const err = new Error(info.message);
                return res.status(401).send({ errorMessage: err.message });
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                };
                const token = jwt.sign({ user: body }, "TOP_SECRET");

                res.status(200).send(token);
            });
        } catch (err) {
            return next({ errorMessage: err.message });
        }
    })(req, res, next);
});

module.exports = router;
