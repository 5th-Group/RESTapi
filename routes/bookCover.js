// Dependencies
const express = require('express')
const router = express.Router()
const BookCover = require('../models/bookCover')


// GET ALL
router.get('/', async(req, res) => {
    let searchDetail = {}
    if (req.query.type != null && req.query.type != '') {
        searchDetail.type = new RegExp(req.body.type, 'i')
    }
    try {
        const bookCovers = await BookCover.find(searchDetail)
        res.render('bookCovers/index', {bookCovers: bookCovers, searchDetail: req.body})
    } catch (err) {
        console.log(err.message)
    }
})


// GET NEW
router.get('/new', async(req, res) => {
    try {
        const bookCover = await new BookCover()
        res.render('bookCovers/new', {bookCover: bookCover})
    } catch (err) {
        console.log(err.message)
    }
})


// POST
router.post('/new', async(req, res) => {
    const bookCover = await new BookCover({
        type: req.body.type,
    })
    try {
        await bookCover.save()
        res.redirect('/covers')
    } catch (err) {
        res.render('bookCovers/new', {
            bookCover: req.body,
            errorMessage: err.message,
        })
    }
})


module.exports = router