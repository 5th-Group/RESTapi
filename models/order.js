//Dependencies
const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    products: [
        {type: mongoose.Types.ObjectId,
        }
    ]
})