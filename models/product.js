// Dependencies
const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");


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


productSchema.virtual("averageScore").get(function () {
    let averageScore = 0
    if(this.review.length > 0) {
        this.review.forEarch(review => {
            averageScore += review.ratedScore
        })
        averageScore /= this.review.length
    }
    return averageScore
})

productSchema.set('toJSON', {virtuals: true})

productSchema.plugin(mongooseLeanVirtuals)

module.exports = mongoose.model("products", productSchema);
