// Dependencies
const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const mongooseLeanGetters = require('mongoose-lean-getters');


const productSchema = new mongoose.Schema({
    detail: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "books",
    },
    cost: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: 0,
        get: toFloat,
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: 0,
        get: toFloat,
    },
    review: [
        {
            type: mongoose.Types.ObjectId,
            ref: "reviews",
        },
    ],
}, {toJSON: {getters: true}});

function toFloat(value) {
    if (typeof value != "undefined") {
        return parseFloat(value.toString())
    }
    return value
}


productSchema.set('toJSON', { virtuals: true})

productSchema.plugin(mongooseLeanVirtuals)
productSchema.plugin(mongooseLeanGetters)


module.exports = mongoose.model("products", productSchema);
