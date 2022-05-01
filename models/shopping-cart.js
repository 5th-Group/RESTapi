//Dependencies
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.Types.ObjectId,
            required: true,
        },
    ],
});
