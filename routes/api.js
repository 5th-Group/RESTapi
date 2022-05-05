//Dependencies
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Product = require("../models/product");
const Review = require('../models/review');
const User = require('../models/users');
const passport = require("passport");
const jwt = require('jsonwebtoken')
require("../auth/auth");

router.get("/", async (req, res) => {
    try {
        const products = await Product.find({})
        .lean({getters: true})
        .populate("review", "ratedScore")
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher", },
            select: "-image -imageType",
        })

        const booksIcon = await Book.find({})
        .select("image imageType")
        .lean({virtuals: true})


        for (i = 0; i < booksIcon.length; i++) {
            products[i].detail.icon = booksIcon[i].iconImgPath
            products[i].averageScore = 0
            if (products[i].review.length > 0) {
                
                products[i].review.forEach(review => {
                    if (review.ratedScore) {
                        products[i].averageScore += review.ratedScore
                    }
                })
                products[i].averageScore = Number(parseFloat(products[i].averageScore / products[i].review.length).toFixed(1))
            }
        }


        res.json(products)


    } catch (err) {
        res.send(err);
    }
});

router.get("/update", async (req, res) => {
    try {
        const books = await Book.find({});
        books.forEach(async (book) => {
            let product = await new Product();
            product.detail = book.id;
            await product.save();
        });
        res.redirect("/")
    } catch (error) {
        console.log(error);
    }
});


router.get("/product/:id", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        .lean({virtuals: true, getters: true})
        .populate({
            path: "review",
            populate: { 
                path: "reviewer", 
                select: "firstName lastName",
            },
        })
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher" },
            select: "-image -imageType",
        })


        const booksIcon = await Book.findById(product.detail._id)
        .select("image imageType")
        .lean({virtuals: true})



        product.detail.icon = booksIcon.iconImgPath
        product.averageScore = 0
        if (product.review.length > 0) {
            
            product.review.forEach(review => {
                if (review.ratedScore) {
                    product.averageScore += review.ratedScore
                }
            })
            product.averageScore /= product.review.length
        }


        res.json(product)


    } catch (err) {
        res.send(err.message)
    }
})

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

                res.status(200).send({token: token, userData: user});
            });
        } catch (err) {
            return next({ errorMessage: err.message });
        }
    })(req, res, next);
});


// GET review
router.get('/review/:id/new', checkAuthenticated, async (req, res) => {

    const review = await new Review()
    const product = await Product.findById(req.params.id)

    try {

    res.render("review/new", {review: review, product: product, isAuthenticated: req.isAuthenticated()})


    // res.status(201).send({infoMessage: "Your review have been posted successfully."})
    } catch (err) {
        res.send(err)
    }
})


router.put('/user/:id/update', checkAuthenticated, async (req, res) => {
    let user
    try {
    
        user = await User.findById(req.params.id)
        user.username = req.body.username
        user.password = req.body.password
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName
        user.gender = req.body.gender
        user.address = req.body.address
        user.email = req.body.email
        user.role = req.body.role
        user.country = req.body.country
        user.phoneNumber = req.body.phoneNumber

        await user.save();
        res.status(204).send({infoMessage: "Successful Update."})

    } catch (err) {
        res.send(err)
    }
})


// POST review
router.post('/review/:id/new', checkAuthenticated, async (req, res) => {

    const review = await new Review({
        product: req.params.id,
        review: req.body.review,
        reviewer: req.user._id,
        ratedScore: req.body.ratedScore,
    })

    try {

    const product = await Product.findById(req.params.id)
    product.review.push(review.id)


    await review.save()
    await product.save()



    res.status(201).send({infoMessage: "Your review have been posted successfully."})
    } catch (err) {
        res.send(err)
    }
})


function checkAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({errorMessage: "Not logged in."})
    }
    next()
}

module.exports = router;
