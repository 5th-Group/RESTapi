// Dependencies
const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    image: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'publisher',
    },
})

module.exports = mongoose.model('books', bookSchema)