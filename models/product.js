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
        min: 0,
        default: 0,
        get: toFloat,
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true,
        min: 0,
        default: 0,
        get: toFloat,
    },
    review: [
        {
            type: mongoose.Types.ObjectId,
            ref: "reviews",
        },
    ],
});

function toFloat(value) {
    if (typeof value != "undefined") {
        return parseFloat(value.toString())
    }
    return value
}

productSchema.virtual("iconImgPath").get(function () {
    // console.log(this.detail)
    if (this.detail.image != null && this.detail.imageType != null) {
        return `data:${this.imageType};charset=utf-8;base64,${this.image.toString("base64")}`;
    }
});



productSchema.set('toJSON', { getters: true})
productSchema.set('toObject', { getters: true})

productSchema.plugin(mongooseLeanVirtuals)
productSchema.plugin(mongooseLeanGetters)


module.exports = mongoose.model("products", productSchema);
