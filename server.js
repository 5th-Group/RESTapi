// Dependencies
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()


// Setting up routes
const indexRouter = require('./routes/index')


// Setting u middleware
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))


// Routing
app.use('/', indexRouter)

// port
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))