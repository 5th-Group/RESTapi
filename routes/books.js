// Dependencies
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const BookCover = require("../models/bookCover");
const Language = require("../models/language");
const Author = require("../models/authors");
const Publisher = require("../models/publisher");
const BookGenre = require("../models/bookGenre");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
const authenticatedOrGuest = require("../auth/authenticatedOrGuest");

// Get All
router.get("/", async (req, res) => {
    let searchDetail = {};
    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }
    try {
        const books = await Book.find(searchDetail);
        res.render("books/index", {
            books: books,
            searchDetail: req.query,
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
        res.render("books/new", {
            book: book,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
        });
    } catch (err) {
        console.log({ message: err.message });
    }
});

//
router.get("/db", async (req, res) => {
    try {
        const books = await Book.find()
            .populate("author genre language publisher")
            .select(
                "title pageCount description author language genre coverType createdAt publishDate publisher isbn"
            );
        res.json(books);
    } catch (err) {
        res.send(err);
    }
});

router.get("/imgdb", async (req, res) => {
    try {
        let icon = [];
        let books = await Book.find().select("image imageType");
        books.forEach((book) => {
            book.icon = book.iconImgPath;
        });
        res.json(books);
    } catch (err) {
        res.send(err);
    }
});

router.get("/detail/:id", getBook, async (req, res) => {
    try {
        const book = await res.book.populate("author genre language publisher");
        res.render("books/detail", { book: book });
    } catch (err) {
        res.send({ message: err.message });
    }
});

// GET EDIT PAGE
router.get("/detail/:id/edit", getBook, async (req, res) => {
    try {
        const authors = await Author.find({});
        const languages = await Language.find({});
        const publishers = await Publisher.find({});
        const bookCovers = await BookCover.find({});
        const bookGenres = await BookGenre.find({});
        const book = await res.book.populate("author genre language publisher");
        res.render("books/edit", {
            book: book,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
        });
    } catch (err) {
        res.redirect("/books");
    }
});

// Create
router.post("/new", async (req, res) => {
    const book = new Book({
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

    saveImg(book, req.body.img);

    try {
        await book.save();
        res.redirect("/books");
    } catch (err) {
        res.render("books/new", {
            book: req.body,
            errorMessage: err.message,
        });
    }
});

// Update
router.put("/detail/:id/edit", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);

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

        await book.save();
        res.redirect("/books");
    } catch (err) {
        res.render("books/edit", { book: req.body, errorMessage: err.message });
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

function saveImg(book, imgEncoded) {
    if (imgEncoded == null) return;
    const img = JSON.parse(imgEncoded);
    if (img != null && imageMimeTypes.includes(img.type)) {
        book.image = new Buffer.from(img.data, "base64");
        book.imageType = img.type;
    }
}

module.exports = router;
