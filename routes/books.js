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
const Review = require("../models/review")
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
const multer = require('multer')
const upload = multer()
const ObjectId = require("mongoose").Types.ObjectId


// Get All
router.get("/", async (req, res) => {
    const user = req.user != null ? req.user : undefined


    let searchDetail = {};

    if (req.query.title != null && req.query.title != "") {
        searchDetail.title = new RegExp(req.query.title, "i");
    }

    try {
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
        
        const data = products.filter((product) => product.detail.title.match(searchDetail.title))

        if (req.query.json) {
            res.status(200).send(data)
        } else {
            res.render("books/index", {
                products: data,
                searchDetail: req.query,
                user: user,
            });
        }
    } catch (err) {
        res.send(err);
    }
});


//GET new
router.get("/new", async (req, res) => {
    const user = req.user != null ? req.user : undefined

    let date;

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
            date: date,
            authors: authors,
            languages: languages,
            publishers: publishers,
            bookCovers: bookCovers,
            bookGenres: bookGenres,
            product: product,
            user: user,
        });
    } catch (err) {
        res.send({ errorMessage: err.message });
    }
});



// GET detail
router.get("/detail/:id", async (req, res) => {
    const user = req.user != null ? req.user : undefined

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

        if (req.query.json) {
            res.status(200).send(product)
        } else {
            res.render("books/detail", {
                product: product,
                user: user,
            });
        }

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


// Create
router.post("/new", upload.single('img'), async (req, res) => {
    const user = req.user != null ? req.user : undefined


    // console.log(JSON.stringify(req.headers))
    console.log(JSON.stringify(req.body))


    const isbn = { isbn10: req.body.isbn10, isbn13: req.body.isbn13 };

    validateObjectId(Author, req.body.author)
    validateObjectId(Language, req.body.language)
    validateObjectId(BookGenre, req.body.genre)
    validateObjectId(BookCover, req.body.coverType)
    validateObjectId(Publisher, req.body.publisher)


    const book = await new Book({
        title: req.body.title,
        pageCount: req.body.pageCount,
        description: req.body.desc,
        author: req.body.author,
        language: req.body.language,
        genre: req.body.genre,
        coverType: req.body.coverType,
        publishDate: new Date(req.body.publishDate).toISOString(),
        publisher: req.body.publisher,
        isbn: isbn,
    });

    const product = await new Product({
        detail: book.id,
        cost: req.body.cost,
        price: req.body.price,
    });


    if(req.file) {
        book.image = new Buffer.from(req.file.buffer, 'base64')
        book.imageType = req.file.mimetype
    } else {
        saveImg(book, req.body.img);
    }


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

        const date = req.body.publishDate

        res.render("books/new", {
            book: book,
            date: date,
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


// Add new review
router.post("detail/:id/new-review", checkAuthenticated, async(req, res) => {
    const review = await new Review({
        product: req.params.id,
        review: req.body.review,
        reviewer: req.user._id,
        ratedScore: req.body.ratedScore,
    })

    try {

    const product = await Product.findById(req.params.id)
    product.review.push(review.id)


    await review.save()
    await product.save()


    res.status(201).send({infoMessage: "Your review have been posted successfully."})
    } catch (err) {
        res.send(err)
    }
})


// Delete
router.delete("/detail/:id", async (req, res) => {
    let product;
    try {
        product = await Product.findById(req.params.id);
        await product.deleteOne();

        if (req.query.json) {
            res.status(200).send("Successful delete")
        } else {
            res.redirect("/books");
        }
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


async function validateObjectId(model, id) {
    if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
        const list = await model.find({id: id})
        if (list.length > 0) return
        return new Error("The item associated with this ID doesn't exist")
    } else {
        return new Error("Invalid Id.")
    }
}


function checkAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({errorMessage: "Not logged in."})
    }
    next()
}


module.exports = router;
