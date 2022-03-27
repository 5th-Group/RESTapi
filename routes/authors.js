const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// Getting all
router.get('/', async(req, res) => {
    let searchDetail = {}
    if(req.query.name != null && req.query.name != '') {
        searchDetail.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchDetail)
        res.render('authors/index', 
        {
        authors: authors,
        searchDetail: req.query
        })
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})


// GET creating page
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})


// GET one
router.get('/:id', getAuthor, async(req, res) => {
    res.render('authors/detail', {author: res.author})
})

// Creating one
router.post('/', async(req, res) => {
    const author = new Author({
        name: req.body.name,
        origin: req.body.origin,
        dateOfBirth: req.body.dateOfBirth,
        biography: req.body.biography
    })
    try {
        const newAuthor = await author.save()
        res.redirect('/authors')
    }catch(err) {
        res.render('authors/new', {
            author: author,
            errorMessage: err.Message
        })
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

// Deleting  one


module.exports = router