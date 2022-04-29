// Dependencies
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    detail: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "books",
    },
    cost: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: "0",
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: "0",
    },
    review: [
        {
            type: mongoose.Types.ObjectId,
            ref: "reviews",
        },
    ],
});

module.exports = mongoose.model("products", productSchema);
