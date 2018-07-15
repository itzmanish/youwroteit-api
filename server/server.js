const express = require('express');
const BodyParser = require('body-parser');
const path = require("path");
const methodOverride = require('method-override');
const flash = require("connect-flash");
const hbs = require("express-handlebars");
const passport = require("passport");

const PORT = 3000;

const app = express();

// tokens and session init
const cookieParser = require("cookie-parser");
const session = require("express-session");

//  Using anti csrf tokens
// const csrf = require("csurf");
// app.use(csrf());


// logger init
const morgan = require('morgan');

const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
// main function starts from here


app.use(express.static(path.join(__dirname, 'public')));

// using moment for post time
// use this on template for date time as $moment{(post.date).format("DD-MM-YYYY")}
app.locals.moment = require("moment");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));

// Setup views
app.engine('.handlebars', hbs({
	extname: '.handlebars',
	defaultLayout: 'main',
	partialsDir: path.join(__dirname, 'views/partials'),
	layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// logging in console
app.use(morgan('dev'));


// Cookie and session
app.use(cookieParser());
app.use(session({
	secret: 'itissecret',
	resave: true,
	saveUninitialized: true,
	expires: 1800000
}));

// flash messeges
app.use(flash());
app.use(function(req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {

	res.locals.user = req.user || null;

	res.locals.success_message = req.flash('success_message');

	res.locals.error_message = req.flash('error_message');

	res.locals.form_errors = req.flash('form_errors');

	res.locals.error = req.flash('error');

	next();


});




// Load Routes
const homeRoutes = require("./routes/indexRouter");
const adminRoutes = require("./routes/adminRouter");
// use Routes
app.use('/admin', adminRoutes);
app.use('/', homeRoutes);


// anti csrf tokens
// app.get('*', function (req, res, next) {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });



app.listen(PORT, () => {
	console.log('Server listning on http://localhost:' + PORT);
});



// extend https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb