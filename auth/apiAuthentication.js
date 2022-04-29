const passport = require("passport");

module.exports = function (req, res, next) {
    return passport.authenticate("login", function (err, user) {
        if (err) return next(err);
        if (user) req.user = user;
        next();
    })(req, res, next);
};
