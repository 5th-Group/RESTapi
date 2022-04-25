const LocalStrategy = require('passport')
.Strategy
const brcypt = require('bcrypt')

function intialize(passport) {
    const authenticateUser = (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false, { message: 'No user with that username'})
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'username'}), authenticateUser)
    passport.serializeUser((user, done) => { })
    passport.deserializeUser((id, done) => { })
}