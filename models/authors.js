// Dependencies
const mongoose = require('mongoose')
const Book = require('./book')

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
    gender: {
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


authorSchema.pre('deleteOne', {document: true}, function(next) {
    Book.find({author: this.id}, (err, books) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            next(new Error(`This author still has books with which ${this.gender == "male" ? "he" : "she"} is associted`))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('authors', authorSchema)