// Dependencies
const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
    },
    lastName: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    biography: {
        type: String,
    }
})

module.exports = mongoose.model('authors', authorSchema)