// Dependencies
const mongoose = require('mongoose')


const publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        address: {type: String, required: true},
        phoneNumber: {type: String, required: true},
        twitter: {type: String},
        facebook: {type: String},
        email: {type: String},
    },
    origin: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'countries',
    }
})


module.exports = mongoose.model('publishers', publisherSchema)