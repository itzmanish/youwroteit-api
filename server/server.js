const express = require("express");
const BodyParser = require("body-parser");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const hbs = require("express-handlebars");
const passport = require("passport");
require("./db/mongoose");

const PORT = 5000;

const app = express();

// tokens and session init
const cookieParser = require("cookie-parser");
const session = require("express-session");
//  Using anti csrf tokens
// const csrf = require("csurf");
// var csrfProtection = csrf({ cookie: true });

// logger init
const morgan = require("morgan");

app.use(express.static(path.join(__dirname, "public")));

// using moment for post time
// use this on template for date time as $moment{(post.date).format("DD-MM-YYYY")}
app.locals.moment = require("moment");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(methodOverride("X-HTTP-Method-Override"));
const { select, currentTime } = require("./helpers/handlebars-helpers");
// Setup views
app.engine(
  ".handlebars",
  hbs({
    extname: ".handlebars",
    defaultLayout: "main",
    helpers: { select, currentTime },
    partialsDir: path.join(__dirname, "views/partials"),
    layoutsDir: path.join(__dirname, "views/layouts")
  })
);
app.set("view engine", ".handlebars");
app.set("views", path.join(__dirname, "views"));

// logging in console
app.use(morgan("dev"));

// use helmet for all http-vulnerability
var helmet = require("helmet");
app.use(helmet());
// Cookie and session
app.use(cookieParser());
app.use(
  session({
    secret: "iskenichebamhai",
    resave: true,
    saveUninitialized: true,
    expires: 1800000,
    secure: true,
    cookie: { httpOnly: true }
  })
);

// flash messeges
app.use(flash());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;

  res.locals.success_message = req.flash("success_message");

  res.locals.error_message = req.flash("error_message");

  res.locals.form_errors = req.flash("form_errors");

  res.locals.error = req.flash("error");

  next();
});

// Use CORS middleware
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Load Routes
const homeRoutes = require("./routes/indexRouter");
const PostRoutes = require("./routes/postsRouter");

// use Routes
app.use("/posts", PostRoutes);
app.use("/", homeRoutes);

// anti csrf tokens
// app.get('*', function (req, res, next) {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

app.listen(PORT, () => {
  console.log("Server listning on http://localhost:" + PORT);
});

// extend https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb
