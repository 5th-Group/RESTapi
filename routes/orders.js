const express = require("express")
const router = express.Router()
const Order = require("../models/order")


router.post('/create', checkAuthenticated, async (req, res) => {

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
        
        res.status(201).send({infoMessage: "Order has been created successfully."})
    } catch (err) {
        res.send({errorMessage: err})
    }
})

function checkAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({errorMessage: "Not logged in."})
    }
    next()
}

module.exports = router