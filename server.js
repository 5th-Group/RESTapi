// Dependencies
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const authenticatedOrGuest = require("./auth/authenticatedOrGuest");
require("dotenv").config();
require("./auth/auth");

// Connect to db
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to database"));

// Setting up routes
const indexRouter = require("./routes/index");
const bookRouter = require("./routes/books");
const authorRouter = require("./routes/authors");
const publisherRouter = require("./routes/publishers");
const countryRouter = require("./routes/countries");
const bookCoverRouter = require("./routes/bookCover");
const bookGenreRouter = require("./routes/bookGenre");
const languageRouter = require("./routes/language");
const apiRouter = require("./routes/api");

// Setting u middleware
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(express.json());
app.use(cookieParser());

// Routing
app.use("/", authenticatedOrGuest, indexRouter);
app.use("/authors", authenticatedOrGuest, authorRouter);
app.use("/books", authenticatedOrGuest, bookRouter);
app.use("/genres", authenticatedOrGuest, bookGenreRouter);
app.use("/publishers", authenticatedOrGuest, publisherRouter);
app.use("/countries", authenticatedOrGuest, countryRouter);
app.use("/covers", authenticatedOrGuest, bookCoverRouter);
app.use("/languages", authenticatedOrGuest, languageRouter);
app.use("/api", authenticatedOrGuest, apiRouter);

// port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
