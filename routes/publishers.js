// Dependencies
const express = require('express')
const { redirect } = require('express/lib/response')
const router = express.Router()
const Publisher = require('../models/publisher')


// GET all
router.get('/', async(req, res) => {
    let searchDetail
    if(req.query.name != null && req.query.name != '') {
        searchDetail.name = new RegExp(req.query.name, 'i')

    }
    try {
        const publishers = await Publisher.find(searchDetail)
        res.render('publishers/index', 
        {
        publishers: publishers,
        searchDetail: req.query
        })
    } catch (err) {
        res.render('publishers/index' , {errorMessage: err})
    }
})


// GET new page
router.get('/new', async(req, res) => {
    res.render('publishers/new', {publisher: new Publisher()})
})


// GET one
router.get('/:id', getPublisher, async(req, res) => {
    res.render('publishers/detail', {publisher: res.publisher})
})


// POST
router.post('/', async(req, res) => {
    const publisher = new Publisher({
        name: req.body.name,
        contact: req.body.contact,
        address: req.body.address,
        origin: req.body.origin,
    })
    try {
        await publisher.save()
        res.redirect('publishers/index')
    } catch {
        res.render('publishers/new', {
            errorMessage: 'Something is wrong',
            publisher: publisher
        })
    }
})


// Reusable function to get one
async function getPublisher(req, res, next) {
    let publisher
    try{
        publisher = Publisher.findById(req.params.id)
        if (publisher == null) {
            res.status(404).json({message: err.message})
        }
    } catch (err){
        res.status(500).json({message: err.message})
    }
    res.publisher = publisher
    next()
}



module.exports = router