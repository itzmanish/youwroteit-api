const {Users} = require('./../models/users');


const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: 'genisys.auth0.com',
    clientID: 'c1qEH2U7ZcAkwW_3c_ETSW7pATHesO-m',
    clientSecret: 'fV4l84k7ScAfFnZzMlmgI6hZ-PanPHrn33VxJ08Q7Ui_RguOhjjl2hhdLzeqXBhY',
    callbackURL: 'http://localhost:3000/signup/auth/callback'
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

passport.use(strategy);
// This can be used to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, (err, user) => {
    done(err, user);
  });
});
