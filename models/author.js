// Dependencies
const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    biography: {
        type: String,
    }
})

module.exports = mongoose.model('authors', authorSchema)