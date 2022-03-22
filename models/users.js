// Dependencies
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        requited: true,
    },
})

module.exports = mongoose.model('user', userSchema)