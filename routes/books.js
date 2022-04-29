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
const authenticatedOrGuest = require("../auth/authenticatedOrGuest");

// Get All
router.get("/", authenticatedOrGuest, async (req, res) => {
    let searchDetail = {};
    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }
    try {
        const books = await Book.find(searchDetail);
        res.render("books/index", {
            books: books,
            searchDetail: req.query,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        res.send(err);
    }
});

router.get("/new", async (req, res) => {
    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});
        const book = await new Book();
        const product = await new Product();
        res.render("books/new", {
            book: book,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            product: product,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        console.log({ message: err.message });
    }
});

//
// router.get("/db", async (req, res) => {
//     let icon = [];
//     try {
//         const books = await Book.find()
//             .populate("author genre language publisher")
//             .select(
//                 "title pageCount description author language genre coverType createdAt publishDate publisher isbn"
//             )
//             .lean();
//         let booksImg = await Book.find().select("image imageType");
//         for (i = 0; i < booksImg.length; i++) {
//             books[i].icon = booksImg[i].iconImgPath;
//         }
//         res.json(books);
//     } catch (err) {
//         res.send(err);
//     }
// });

router.get("/detail/:id", getBook, async (req, res) => {
    try {
        const book = await res.book.populate("author genre language publisher");
        res.render("books/detail", {
            book: book,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        res.send({ message: err.message });
    }
});

// GET EDIT PAGE
router.get("/detail/:id/edit", getBook, getProduct, async (req, res) => {
    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});
        const book = await res.book.populate("author genre language publisher");
        const product = await res.product;

        res.render("books/edit", {
            book: book,
            product: product,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            isAuthenticated: req.isAuthenticated(),
        });
    } catch (err) {
        res.redirect("/books");
    }
});

// Create
router.post("/new", async (req, res) => {
    const book = await new Book({
        title: req.body.title,
        pageCount: req.body.pageCount,
        description: req.body.desc,
        author: req.body.author,
        language: req.body.language,
        genre: req.body.genre,
        coverType: req.body.coverType,
        publishDate: new Date(req.body.publishDate),
        publisher: req.body.publisher,
        isbn: req.body.isbn,
    });

    const product = await new Product({
        product: book.id,
        cost: req.body.cost,
        price: req.body.price,
    });

    saveImg(book, req.body.img);

    try {
        await book.save();
        await product.save();
        res.redirect("/books");
    } catch (err) {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});
        res.render("books/new", {
            book: req.body,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            errorMessage: err.message,
            isAuthenticated: req.isAuthenticated(),
        });
    }
});

// Update
router.put("/detail/:id/edit", getBook, getProduct, async (req, res) => {
    let book;
    let product;
    try {
        book = await res.book;
        product = await res.product;

        book.title = req.body.title;
        book.pageCount = req.body.pageCount;
        book.description = req.body.desc;
        book.author = req.body.author;
        book.language = req.body.language;
        book.genre = req.body.genre;
        book.coverType = req.body.coverType;
        book.publishDate = new Date(req.body.publishDate);
        book.publisher = req.body.publisher;
        book.isbn = req.body.isbn;

        product.cost = req.body.cost;
        product.price = req.body.price;

        await book.save();
        await product.save();
        res.redirect("/books");
    } catch (err) {
        res.render("books/edit", {
            book: req.body,
            errorMessage: err.message,
            isAuthenticated: req.isAuthenticated(),
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
