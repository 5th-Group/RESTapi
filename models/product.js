// Dependencies
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "books",
    },
    cost: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    review: [
        {
            type: mongoose.Types.ObjectId,
            ref: "reviews",
        },
    ],
});

module.exports = mongoose.model("products", productSchema);
