const express = require('express');
const server = require("server");
const BodyParser = require('body-parser');
const path = require("path");
const methodOverride = require('method-override');


const PORT = 3000;
// passport things
const passport = require("passport");
const LocalStrategy = require('passport-local');
const TwitterStrategy = require('passport-twitter');
const GoogleStrategy = require('passport-google');
const FacebookStrategy = require('passport-facebook');
// tokens and session init
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const session = require("express-session");
// logger init
const morgan = require('morgan');

const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
// main function starts from here

const app = express();

// using moment for post time
// use this on template for date time as $moment{(post.date).format("DD-MM-YYYY")}
app.locals.moment = require("moment");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: false}));
app.use(methodOverride('X-HTTP-Method-Override'));


app.use(express.static(path.join(__dirname, 'public')));
// logging in console
app.use(morgan('dev'));

// Routing setup
const routes = require("./routes/indexRouter");
app.use('/', routes);


// Cookie and session
app.use(cookieParser());
app.use(session({
  secret: 'itissecret',
  resave: true,
  saveUninitialized: true
}));

// Passport 
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use((req, res, next) => {
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;
  res.locals.loggedIn = false;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if(req.session.passport && typeof req.session.passport.user != 'undefined') res.locals.loggedIn = true;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});


app.listen(PORT, () => {
  console.log('Server listning on http://localhost:'+ PORT);
});



// extend https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb