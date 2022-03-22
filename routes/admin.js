// Dependencies
const express = require('express')
const router = express.Router()
const Book = require('../models/books')
const Author = require('../models/author')
const User = require('../models/users')


// GET index page
router.get('/', (req, res) => {
    res.render('/admin/index')
})


// 
