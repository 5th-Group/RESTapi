// Dependencies
const mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('book', booksSchema)