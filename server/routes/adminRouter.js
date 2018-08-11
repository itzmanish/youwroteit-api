const express = require("express");
const router = express.Router();
const { ObjectID } = require("mongodb");
const { Users } = require("./../models/users");
const { userAuthenticated } = require("./../middleware/auth/authenticate");
const passport = require("passport");
require("./../lib/auth/passport");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", userAuthenticated, (req, res) => {
  res.render("admin/index", {
    user: req.user.firstname,
    title: "Youwroteit-Admin panel"
  });
});

router.get("/login", (req, res) => {
  res.render("layouts/login", { layout: "login" });
});
// post users
router.post("/signup", (req, res) => {
  var body = _.pick(req.body, ["firstname", "lastname", "email", "password"]);
  var user = new Users({
    email: body.email.toLowerCase(),
    firstname: body.firstname,
    lastname: body.lastname
  });
  user.password = user.encryptPassword(body.password);
  user
    .save()
    .then(user => {
      res.send(user);
    })
    .catch(e => {
      res.status(404).send();
    });
});
// Perform the login
// get users
router.get("/users/me", userAuthenticated, (req, res) => {
  res.send(req.user);
});

router.get("/users", userAuthenticated, (req, res) => {
  Users.find().then(
    user => {
      res.send({ user });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

// POST login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return err;
    req.logIn(user, function(err) {
      if (err) {
        return err;
      }
      console.log(user);
      return res.send(user);
    });
  })(req, res, next);
});

// router.post('/login', (req, res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//   Users.findByCredentials(body.email, body.password).then((user) => {
//     console.log(user);
//     req.flash('success_message', 'Successfully logged in');
//     res.redirect('/');
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });

router.delete("/users/me/token", userAuthenticated, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
    });
});
// GET /logout
// router.get('/logout', function(req, res, next) {
//   if (req.session) {
//     // delete session object
//     req.session.destroy(function(err) {
//       if (err) {
//         return next(err);
//       }
//       else {
//         return res.redirect('/');
//       }
//     });
//   }
// });

router.get("/logout", userAuthenticated, (req, res) => {
  req.logOut();
  res.status(200).send();
});

module.exports = router;
