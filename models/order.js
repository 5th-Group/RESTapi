//Dependencies
const mongoose = require('mongoose')
const mongooseLeanGetters = require('mongoose-lean-getters')


const orderSchema = new mongoose.Schema({
    products: [
        {
            productDetail: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'products'
            },
            price: {
                type: mongoose.Types.Decimal128,
                required: true,
                get: toFloat,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
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
        get: toFloat,
    },
})

function toFloat(value) {
    if (typeof value != "undefined") {
        return parseFloat(value.toString())
    }
    return value
}

orderSchema.set('toJSON', { getters: true})
orderSchema.set('toObject', { getters: true})

orderSchema.plugin(mongooseLeanGetters)

module.exports = mongoose.model('orders', orderSchema)
