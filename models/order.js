//Dependencies
const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    products: [
        {
            detail: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            total: {
                type: mongoose.Types.Decimal128,
                required: true,
            }
        }
    ],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        required: true,
        default: "Received",
    },
    customer: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    totalPrice: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
})


const detailSchema = new mongoose.Schema({

})


module.exports = {
    Order: mongoose.model('orders', orderSchema),
    OrderDetail: mongoose.model('orderDetails', detailSchema),
}
