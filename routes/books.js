const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const BookCover = require('../models/bookCover')
const Language = require('../models/language')
const Author = require('../models/author')
const Publisher = require('../models/publisher')
const BookGenre = require('../models/bookGenre')

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

router.get('/new', async (req, res) => {
    try {
        const authors = await Author.find({})
        const languages = await Language.find({})
        const publishers = await Publisher.find({})
        const bookCovers = await BookCover.find({})
        const bookGenres = await BookGenre.find({})
        const book = await new Book()
        res.render('books/new', { 
            book: book, 
            authors: authors, 
            languages: languages, 
            publishers: publishers, 
            bookCovers: bookCovers,
            bookGenres: bookGenres,
        })
    } catch (err) {
        console.log({message: err.message})
    }

})


router.get('/detail/:id', getBook, (req, res) => {
    res.send(res.book)
})




// Create
router.post('/new', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        pageCount: req.body.pageCount,
        description: req.body.desc,
        author: req.body.author,
        language: req.body.language,
        genre: req.body.genre,
        coverType: req.body.coverType,
        publishDate: req.body.publishDate,
        publisher: req.body.publisher,
        isbn: req.body.isbn,
    })
    try {
        await book.save()
        res.redirect('/books')
    } catch (err) {
        res.render('books/new', {
            book: req.body,
            errorMessage: err.message,
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