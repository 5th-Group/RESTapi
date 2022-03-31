// Dependencies
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
require('dotenv').config()


// Connect to db
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to database'))


// Setting up routes
const indexRouter = require('./routes/index')
const bookRouter = require('./routes/books')
const authorRouter = require('./routes/authors')
const publisherRouter = require('./routes/publishers')
const countryRouter = require('./routes/countries')
const bookCoverRouter = require('./routes/bookCover')
const bookGenreRouter = require('./routes/bookGenre')
const languageRouter = require('./routes/language')


// Setting u middleware
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())


// Routing
app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.use('/books/genres', bookGenreRouter)
app.use('/publishers', publisherRouter)
app.use('/countries', countryRouter)
app.use('/covers', bookCoverRouter)
app.use('/languages', languageRouter)


// port
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))