const { Users } = require("./../../models/users");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
    done(err, user);
  });
});

// Configure Passport to use Auth0

// passport.use(
//   new LocalStrategy(
//     { usernameField: "email", passwordField: "password" },
//     (email, password, done) => {
//       Users.findOne({ email: email }).then(user => {
//         if (!user) return done(null, false, { message: "No user found" });

//         bcrypt.compareSync(password, user.password, (err, matched) => {
//           if (err) return err;
//           if (matched) {
//             return done(null, user);
//           } else {
//             return done(null, false, { message: "Incorrect password" });
//           }
//         });
//       });
//     }
//   )
// );

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      Users.findOne({ email: email }, function(err, user) {
        if (err) {
          return errHandler(err);
        }
        if (!user) {
          return done(null, false, {
            errMsg:
              "User does not exist, please" +
              ' <a class="errMsg" href="/signup">signup</a>'
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { errMsg: "Invalid password try again" });
        }
        return done(null, user);
      });
    }
  )
);
