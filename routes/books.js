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

    if (req.user != null) {
        user = req.user
    }

    let searchDetail = {};
    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }
    try {
        // const books = await Book.find(searchDetail).lean({virtuals: true})
        const products = await Product.find({})
        .lean({getters: true,})
        .populate("review", "ratedScore")
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher" },
        })



        for (i = 0; i < products.length; i++) {
            products[i].detail.icon = parseImg(products[i].detail.image, products[i].detail.imageType)
            products[i].averageScore = 0
            if (products[i].review.length > 0) {
                
                products[i].review.forEach(review => {
                    if (review.ratedScore) {
                        products[i].averageScore += review.ratedScore
                    }
                })
                products[i].averageScore = Number(parseFloat(products[i].averageScore / products[i].review.length).toFixed(1))
            }
        }
        



        res.render("books/index", {
            // books: books,
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
        res.send({ message: err.message });
    }
});



// GET detail
router.get("/detail/:id", async (req, res) => {
    let user;

    if(typeof req.user !== 'undefined') {
        user = req.user
    }

    try {
        const product = await Product.findById(req.params.id)
        .lean({virtuals: true, getters: true})
        .populate({
            path: "review",
            populate: { 
                path: "reviewer", 
                select: "firstName lastName",
            },
        })
        .populate({
            path: "detail",
            populate: { path: "author genre language publisher" },
            select: "-image -imageType",
        })


        const booksIcon = await Book.findById(product.detail._id)
        .select("image imageType")
        .lean({virtuals: true})

        product.detail.icon = booksIcon.iconImgPath
        product.averageScore = 0
        if (product.review.length > 0) {
            
            product.review.forEach(review => {
                if (review.ratedScore) {
                    product.averageScore += review.ratedScore
                }
            })
            product.averageScore /= product.review.length
        }

        // console.log(product)

        res.render("books/detail", {
            // book: book,
            product: product,
            user: user,
        });
    } catch (err) {
        res.send({ message: err.message });
    }
});

// GET EDIT PAGE
router.get("/detail/:id/edit", async (req, res) => {
    let user = typeof(req.user)  !== 'undefined' ? req.user : undefined

    let book;
    let product;

    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});

        product = await Product.findById(req.params.id)

        book = await Book.findById(product.detail)
        .populate("author genre language publisher coverType");

        const date = book.publishDate.toISOString().split('T')[0]
        


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
router.put("/detail/:id/edit", async (req, res) => {
    let book;
    let product;

    let user = typeof(req.user)  !== 'undefined' ? req.user : undefined

    try {
        product = await Product.findById(req.params.id)

        book = await Book.findById(product.detail);


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

        const productPayload = {cost : req.body.cost, price : req.body.price}

        const isbn = {isbn10 : req.body.isbn10, isbn13: req.body.isbn13}

        const bookPayload = req.body
        bookPayload.isbn = isbn

        res.render("books/edit", {
            book: bookPayload,
            product: productPayload,
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


function parseImg(image, imageType) {
    if (image != null && imageType != null) {
        return `data:${imageType};charset=utf-8;base64,${image.toString("base64")}`;
    }
};


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
