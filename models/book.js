// Dependencies
const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    author: {
        type: [mongoose.Types.ObjectId],
        ref: "authors",
        required: true,
        validate: (v) => Array.isArray(v) && v.length > 0,
    },
    language: {
        type: mongoose.Types.ObjectId,
        ref: "languages",
        required: true,
    },
    genre: [
        {
            type: mongoose.Types.ObjectId,
            ref: "bookGenres",
            required: true,
        },
    ],
    coverType: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "bookCovers",
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    image: {
        type: Buffer,
        required: true,
    },
    imageType: {
        type: String,
        required: true,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "publishers",
    },
    isbn: {
        isbn10: {
            type: String,

        },
        isbn13: {
            type: String,
        },
    },
});

bookSchema.virtual("iconImgPath").get(function () {
    if (this.image != null && this.imageType != null) {
        return `data:${this.imageType};charset=utf-8;base64,${this.image.toString("base64")}`;
    }
});


bookSchema.pre('save', {document: true}, function(next) {
    console.log(this.isbn.isbn10)
    console.log(this.isbn.isbn13)
    if ((this.isbn.isbn10 == null || this.isbn.isbn10 == '') && (this.isbn.isbn13 == null || this.isbn.isbn13 == '')) {
        next(new Error(`Atleast one ISBN number is required.`))
    } else {
        next()
    }
})

bookSchema.plugin(mongooseLeanVirtuals)


module.exports = mongoose.model("books", bookSchema);
