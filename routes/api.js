//Dependencies
const express = require("express");
const router = express.Router();
// const Book = require("../models/book");
const Product = require("../models/product");
const Review = require('../models/review');
const User = require('../models/users');
const Order = require("../models/order");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
require("../auth/auth");

router.get("/", async (req, res) => {

    let searchDetail = {};
    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }

    try {
        const products = await Product.find({})
        .lean({getters: true})
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher", select: "-languageCode -dateOfBirth -biography -code -contact"},
            select: "-image -imageType",
        })
        .populate("review", "ratedScore")


        const productsIcon = await Product.find({})
        .lean()
        .populate("detail", "image imageType")


        for (i = 0; i < products.length; i++) {
            products[i].detail.icon = parseImg(productsIcon[i].detail.image, productsIcon[i].detail.imageType);
        }


        for (i = 0; i < products.length; i++) {
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


        const data = products.filter((product) => product.detail.title.match(searchDetail.title))

        res.status(200).send({infoMessage: "Get products successfully", data: data})


    } catch (err) {
        res.send(err);
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


        const productIcon = await Product.findById(req.params.id)
        .lean()
        .populate("detail", "image imageType")



        product.detail.icon = parseImg(productIcon.detail.image, productIcon.detail.imageType)
        product.averageScore = 0
        if (product.review.length > 0) {
            product.review.forEach(review => {
                if (review.ratedScore) {
                    product.averageScore += review.ratedScore
                }
            })
            product.averageScore = Number(parseFloat(product.averageScore / product.review.length).toFixed(1))
        }


        res.status(200).send({infoMessage: "Get product successfully", product: product})


    } catch (err) {
        res.send(err.message)
    }
})

// POST register
router.post("/register", async (req, res) => {

    let hashedPassword;

    if (typeof(req.body.password) !== 'undefined' && req.body.password != null) {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
    } else {
        new Error('Empty password')
    }


    const address = [{
        location: req.body.location,
        type: req.body.type,
    }]

    const user = new User({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.fname,
        lastName: req.body.lname,
        gender: req.body.gender,
        address: address,
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

                // user.populate('country')
                const userData = await User.findById(user._id).populate("country").select("-password")

                const body = {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                };
                const token = jwt.sign({ user: body }, "TOP_SECRET");

                res.status(200).send({token: token, userData: userData});
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

// router.get('/user/update', checkAuthenticated, async (req, res) => {
//     try {
//         res.send(req.user._id)
//     } catch (err) {
        
//     }
// })

router.put('/user/update', checkAuthenticated, async (req, res) => {

    let updateData = {};
    let updateDataArray = {};

    for (key in req.body) {
        if (Array.isArray(req.body[key])) {
            updateDataArray[key] = req.body[key];
        } else {
            updateData[key] = req.body[key];
        }
    }

    try {

        user = await User.findOneAndUpdate({_id: req.user._id}, {$set: updateData, $push: updateDataArray}, {returnOriginal: false})
        .populate("country")
        .clone()


        res.send({infoMessage: "Successful Update.", newData: user})


    } catch (err) {
        res.send({errorMessage: err})
    }
})

// PUT user
router.put('/user/update-address', checkAuthenticated, async (req, res) => {

    let updateData = {};


    try {
        let data = await req.body


        if(typeof(data) !== 'undefined') {
            updateData.address = await data.address
            updateData.id = await data.pos
        } else {
            new Error('Empty address.')
        }

    
        user = await User.findOneAndUpdate({"_id": req.user._id, "address._id": updateData.id}, {$set: {"address.$.type": updateData.address.type, "address.$.location": updateData.address.location}}, {returnOriginal: false})
        .clone()
        .populate("country")

        res.send({infoMessage: "Successful Update.", newData: user})

    } catch (err) {
        res.send({errorMessage: err})
    }
})

// GET 
router.get('/user/orders', checkAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({customer: req.user._id})
        .populate({
            path: "products.productDetail",
            populate: {path: "detail", select: "title"},
            select: "detail",
        })
        .select("-customer")
        .lean({getters: true})


        res.status(200).send(orders)

    } catch (err) {
        res.send(err)
    }
})


// POST Order
router.post('/order/create', checkAuthenticated, async (req, res) => {

    let totalPrice = (listProducts) => {
        let sum = 0;
        if (typeof(listProducts) !== 'undefined' && listProducts.length > 0){
            listProducts.forEach(product => {
                sum = sum + (product.price * product.quantity) 
            })
        }

        return sum
    }

    const order = await new Order({
        products: req.body.products,
        customer: req.user._id,
        totalPrice: totalPrice(req.body.products)
    });

    try {
        await order.save()
        
        res.send({infoMessage: "Order has been created successfully."})
    } catch (err) {
        res.send({errorMessage: err})
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

function parseImg(image, imageType) {
    if (image != null && imageType != null) {
        return `data:${imageType};charset=utf-8;base64,${image.toString("base64")}`;
    }
};


module.exports = router;
