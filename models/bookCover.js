// Dependencies
const mongoose = require('mongoose')

const bookCoverSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('bookCovers', bookCoverSchema)