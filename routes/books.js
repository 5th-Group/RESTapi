const express = require('express')
const router = express.Router()
const Book = require('../models/books')

// Getting all
router.get('/', async(req, res) => {
    try {
        const books = await Book.find()
        res.send(books)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Getting one
router.get('/:id', getBook, (req, res) => {
    res.send(res.book.name)
})

// Creating one
router.post('/', async(req, res) => {
    const bookId = 1
    const book = new Book({
        id: req.body.id,
        name: req.body.name,
    })
    try {
        const newBook = await book.save()
        res.status(201).json(newBook)
    }catch(err) {
        res.status(400).json({ message: err.message})
    }
})

async function getBook(req, res, next) {
    let book
    try {
        book = await Book.findById(req.params.id)
        if(book == null) {
            res.status(404).json({message: "Can't find that book"})
        }
    }catch (err){
        res.status(500).json({message:err.message})
    }
    res.book = book
    next()
}

// Updating one
router.patch('/:id', getBook, async (req, res) => {
    if(req.body.name != null) {
        res.book.name = req.body.name
    }
    try {
        const updatedBook = await res.book.save()
        res.json({message: 'Updated successfully'})
    }catch (err) {
        res.status(400).json({message: err.message})
    }
})

// Deleting  one
router.delete('/:id', getBook, async (req, res) => {
    try {
        await res.book.remove()
        res.json({message: 'Deleted successfully'})
    }catch (err) {
        res.status(500).json({message:err.message})
    }
})

module.exports = router