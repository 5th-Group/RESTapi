//Dependencies
const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.Types.ObjectId,
            required: true,
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
        default: "received",
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