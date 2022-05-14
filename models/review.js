// Dependencies
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "products",
    },
    review: {
        type: String,
        required: true,
    },
    reviewer: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "users",
    },
    ratedScore: {
        type: Number,
        required: true,
        min: 0
    },
});

module.exports = mongoose.model("reviews", reviewSchema);
