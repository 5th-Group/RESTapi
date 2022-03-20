const mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('Books', booksSchema)