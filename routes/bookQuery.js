// Dependencies
const express = require('express')
const router = express.Router()
const Book = require('../models/book')


// Get All
router.get('/', async (req, res) => {
    let searchDetail = {}
    if (req.query.title != null && req.query.title != '') {
        searchDetail.title = new RegExp(req.query.title, 'i')
    }
    try {
        const books = await Book.find(searchDetail)
        res.json(books)
    } catch (err) {
        res.send(err)
    }
})



router.get('/:id', getBook, async(req, res) => {
    try {
        const book = await res.book.populate('author genre language publisher')
        res.send(book)
    } catch (err) {
        res.send({message: err.message})
    }
})


// GET EDIT PAGE



// Create



// Update



// Delete




// Function to find book
async function getBook(req, res, next) {
    let book
    try{
        book = await Book.findById(req.params.id)
        if(book == null) {
            res.status(404).json({message: "Can't find that book"})
        }
    } catch(err) {
        res.status(500).json({message: err.message})
    }
    res.book = book
    next()
}




module.exports = router