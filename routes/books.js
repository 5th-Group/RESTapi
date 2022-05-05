// Dependencies
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const BookCover = require("../models/bookCover");
const Language = require("../models/language");
const Author = require("../models/authors");
const Publisher = require("../models/publisher");
const BookGenre = require("../models/bookGenre");
const Product = require("../models/product");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
// const authenticatedOrGuest = require("../auth/authenticatedOrGuest");


// Get All
router.get("/", async (req, res) => {
    let user;
    let searchDetail = {};
    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }
    try {
        const books = await Book.find(searchDetail).lean({virtuals: true})
        const products = await Product.find(searchDetail)
        .lean({virtuals: true})
        .populate("review")
        

        if (req.user != null) {
            user = req.user
        }

        // res.send({books: books})
        res.render("books/index", {
            books: books,
            products: products,
            searchDetail: req.query,
            user: user,
        });
    } catch (err) {
        res.send(err);
    }
});


//GET new
router.get("/new", async (req, res) => {
    let user;
    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});
        const book = await new Book();
        const product = await new Product();

        if(typeof req.user !== 'undefined') {
            user = req.user
        }

        

        res.render("books/new", {
            book: book,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            product: product,
            user: user,
        });
    } catch (err) {
        console.log({ message: err.message });
    }
});



// GET detail
router.get("/detail/:id", getBook, async (req, res) => {
    let user;
    try {
        const book = await res.book.populate("author genre language publisher");

        if(typeof req.user !== 'undefined') {
            user = req.user
        }

        res.render("books/detail", {
            book: book,
            user: user,
        });
    } catch (err) {
        res.send({ message: err.message });
    }
});

// GET EDIT PAGE
router.get("/detail/:id/edit", getBook, getProduct, async (req, res) => {
    let user = typeof(req.user)  !== 'undefined' ? req.user : undefined

    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});

        const book = await Book.findById(req.params.id)
        .populate("author genre language publisher coverType");

        const date = book.publishDate.toISOString().split('T')[0]
        

        const product = await Product.findOne({detail : {_id : req.params.id}});


        res.render("books/edit", {
            book: book,
            product: product,
            authors: authors,
            date: date,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            user: user,
        });
    } catch (err) {
        res.redirect("/books");
    }
});


// // GET Edit price
// router.get("/detail/:id/")

// Create
router.post("/new", async (req, res) => {
    let user;

    if(typeof req.user !== 'undefined') {
        user = req.user
    }


    const isbn = { isbn10: req.body.isbn10, isbn13: req.body.isbn13 };
    const book = await new Book({
        title: req.body.title,
        pageCount: req.body.pageCount,
        description: req.body.desc,
        author: req.body.author,
        language: req.body.language,
        genre: req.body.genre,
        coverType: req.body.coverType,
        publishDate: new Date(req.body.publishDate).toISOString().split('T')[0],
        publisher: req.body.publisher,
        isbn: isbn,
    });

    const product = await new Product({
        detail: book.id,
        cost: req.body.cost,
        price: req.body.price,
    });

    saveImg(book, req.body.img);

    try {
        await book.save()
        await product.save()
        res.redirect("/books");
    } catch (err) {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});

        res.render("books/new", {
            book: book,
            product: product,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            errorMessage: err.message,
            user: user,
        });
    }
});

// Update
router.put("/detail/:id/edit", getBook, getProduct, async (req, res) => {
    let book;
    let product;

    let user = typeof(req.user)  !== 'undefined' ? req.user : undefined

    try {
        book = await Book.findById(req.params.id);
        
        product = await Product.findOne({detail : {_id : req.params.id}});


        book.title = req.body.title;
        book.pageCount = req.body.pageCount;
        book.description = req.body.desc;
        book.author = req.body.author;
        book.language = req.body.language;
        book.genre = req.body.genre;
        book.coverType = req.body.coverType;
        book.publishDate = new Date(req.body.publishDate).toISOString().split('T')[0];
        book.publisher = req.body.publisher;
        book.isbn.isbn10 = req.body.isbn10;
        book.isbn.isbn13 = req.body.isbn13;



        product.cost = req.body.cost;
        product.price = req.body.price;

        await book.save();
        await product.save();



        res.redirect("/books");
    } catch (err) {

        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});

        const product = {cost : req.body.cost, price : req.body.price}


        res.render("books/edit", {
            book: req.body,
            product: product,
            date: req.body.publishDate,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            errorMessage: err.message,
            user: user,
        });
    }
});




// Delete
router.delete("/detail/:id", async (req, res) => {
    let author;
    try {
        author = await Book.findById(req.params.id);
        await author.deleteOne();
        res.redirect("/books");
    } catch (err) {
        res.send({ error: err.message });
    }
});

// Function to find book
async function getBook(req, res, next) {
    let book;
    try {
        book = await Book.findById(req.params.id);
        if (book == null) {
            res.status(404).json({ message: "Can't find that book" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.book = book;
    next();
}

async function getProduct(req, res, next) {
    let product;
    try {
        product = await Product.findOne({
            product: res.book.id,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.product = product;
    next();
}

function saveImg(book, imgEncoded) {
    if (imgEncoded == null) return;
    const img = JSON.parse(imgEncoded);
    if (img != null && imageMimeTypes.includes(img.type)) {
        book.image = new Buffer.from(img.data, "base64");
        book.imageType = img.type;
    }
}

module.exports = router;
