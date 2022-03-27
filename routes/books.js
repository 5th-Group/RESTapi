const express = require('express')
const router = express.Router()
const Book = require('../models/book')

/*// Getting all
router.get('/', (req, res) => {
    try {
        const books = await Book.find({})
        res.send(books)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
    res.render('books/index')
})

// Getting one
router.get('/:id', getBook, (req, res) => {
    res.send(res.book.name)
})

// Creating one
router.post('/', async(req, res) => {
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

module.exports = router*/

// Get All
router.get('/', async (req, res) => {
    let searchDetail = {}
    if (req.query.title != null && req.query.title != '') {
        searchDetail.title = new RegExp(req.query.title, 'i')
    }
    try {
        const books = await Book.find(searchDetail)
        res.render('books/index', {
            books: books,
            searchDetail: req.query
        })
    } catch (err) {
        res.send(err)
    }
})

router.get('/new', (req, res) => {
    res.render('books/new', { book: new Book() })
})


router.get('/:id', getBook, (req, res) => {
    res.send(res.book)
})




// Create
router.post('/', async (req, res) => {
    const book = new Book({
        name: req.body.title,
    })
    try {
        const newBook = await book.save()
        res.redirect('books')
    }catch (err) {
        res.render('books/new', {
        book: book,
        errorMessage: err.Message
        })
    }
})


// Update
router.patch('/', (req, res) => {

})


// Delete
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.json({message: 'Deleted successfully'})
        res.redirect('/')
    }catch (err) {
        res.status(500).json({message:err.message})
    }
})


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