// Dependencies
const mongoose = require('mongoose')

const bookGenreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('bookGenres', bookGenreSchema)