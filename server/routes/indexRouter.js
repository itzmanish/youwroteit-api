const express = require("express");
const router = express.Router();
const { Users } = require("./../models/users");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const { userAuthenticated } = require("./../middleware/auth/authenticate");
const passport = require("passport");
require("./../lib/auth/passport");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});
// Get Requests

router.get("/admin", (req, res) => {
  res.render("admin/index");
});
router.get("/signup", (req, res) => {
  res.render("layouts/login", { layout: "signup" });
});

router.get("/login", (req, res) => {
  res.render("layouts/login", { layout: "login" });
});

router.get("/users/me", (req, res) => {
  res.send(req.user);
});

router.get("/users", (req, res) => {
  Users.find().then(
    user => {
      res.json({ user });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).send();
});

// Post Request
// post users
router.post("/signup", async (req, res) => {
  var body = _.pick(req.body, ["firstname", "lastname", "email", "password"]);
  var newUser = new Users({
    email: body.email.toLowerCase(),
    firstname: body.firstname,
    lastname: body.lastname
  });
  newUser.password = await bcrypt.hash(body.password, 10);
  let user = await newUser.save();
  try {
    if (user) {
      return res.json(user);
    }
  } catch (e) {
    res.json(e);
  }
});

// POST login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (!user) {
      return res.status(409).json(info.errMsg);
    }
    req.login(user, function(err) {
      if (err) {
        console.error(err);
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next);
});

router.delete("/:username", (req, res) => {
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

module.exports = router;
