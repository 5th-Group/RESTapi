// Dependencies
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    address: {
        type: Array,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "user",
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "countries",
    },
    phoneNumber: {
        type: String,
        requited: true,
    },
});

userSchema.pre("save", { document: true }, function (next) {
    mongoose
        .model("users", userSchema)
        .find({ username: this.username }, (err, users) => {
            if (err) {
                next(err);
            } else if (users.length > 0) {
                next(new Error("This username has already been used."));
            } else {
                next();
            }
        });
});

module.exports = mongoose.model("users", userSchema);
