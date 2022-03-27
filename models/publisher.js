// Dependencies
const mongoose = require('mongoose')


const publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    }
})


module.exports = mongoose.model('publisherS', publisherSchema)