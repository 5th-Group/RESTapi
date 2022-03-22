// Dependencies
const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        requited: true,
    },
})

module.exports = mongoose.model('author', authorSchema)