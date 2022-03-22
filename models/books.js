// Dependencies
const mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    publicationDate: {
        type: Date,
        required: true,
    },
    
})

module.exports = mongoose.model('book', booksSchema)