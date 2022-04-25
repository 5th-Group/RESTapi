const passport = require("passport");

module.exports = function authenticatedOrGuest(req, res, next) {
    return passport.authenticate(
        "jwt",
        { session: false },
        function (err, user) {
            if (err) return next(err);
            if (user) req.user = user;
            next();
        }
    )(req, res, next);
};
