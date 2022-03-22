const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// Getting all
router.get('/', async(req, res) => {
    try {
        const authors = await Author.find()
        res.send(authors)
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

// Getting one
router.get('/:id', getAuthor, (req, res) => {
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

async function getAuthor(req, res, next) {
    let author
    try {
        author = await Author.findById(req.params.id)
        if(author == null) {
            res.status(404).json({message: "Can't find that author"})
        }
    }catch (err){
        res.status(500).json({message:err.message})
    }
    res.author = author
    next()
}

// Updating one
router.patch('/:id', getAuthor, async (req, res) => {
    if(req.body.name != null && req.body.name != '') {
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
router.delete('/:id', getAuthor, async (req, res) => {
    try {
        await res.book.remove()
        res.json({message: 'Deleted successfully'})
    }catch (err) {
        res.status(500).json({message:err.message})
    }
})

module.exports = router