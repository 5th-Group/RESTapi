const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const User = require("../models/users");

passport.use(
    "login",
    new localStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ username });

                if (!user) {
                    return done(null, false, { message: "User not found!" });
                }

                const validate = await bcrypt.compare(password, user.password);

                if (!validate) {
                    return done(null, false, {
                        message: "Username or Password is incorrect",
                    });
                }


                delete user.password

                return done(null, user, { message: "Logged in successfully" });
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            secretOrKey: "TOP_SECRET",
            jwtFromRequest: ExtractJWT.fromExtractors([
                (req) => cookieExtractor(req),
                ExtractJWT.fromAuthHeaderAsBearerToken()
            ]),
        },
        async (token, done) => {
            try {
                // console.log(token.user.role)
                return done(null, token.user);
            } catch (err) {
                done(err);
            }
        }
    )
);

var cookieExtractor = function (req) {
    let token;
    if (req && req.cookies) {
        token = req.cookies["access_token"];
    }
    return token;
};
