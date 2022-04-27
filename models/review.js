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
        type: String,
        required: true,
    },
    ratedScore: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("reviews", reviewSchema);
