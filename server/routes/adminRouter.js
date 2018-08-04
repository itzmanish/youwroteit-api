const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const slugify = require("slugify");
const { ObjectID } = require('mongodb');
const { Users } = require('./../models/users');
const { Posts } = require('./../models/posts');
const { userAuthenticated } = require("./../middleware/auth/authenticate");
const _ = require('lodash');
const passport = require("passport");
require("./../lib/auth/passport");

router.all('/*', (req, res, next) => {

  req.app.locals.layout = 'admin';
  next();

});



router.get('/', userAuthenticated, (req, res) => {
  res.render('admin/index', { user: req.user.firstname, title: 'Youwroteit-Admin panel' });
});

router.get('/login', (req, res) => {
  res.render('layouts/login', {layout: 'login'});
});
// post users
router.post('/signup', (req, res) => {
  var body = _.pick(req.body, ['firstname', 'lastname', 'email', 'password']);
  var user = new Users({
    email: body.email.toLowerCase(),
    firstname: body.firstname,
    lastname: body.lastname,
  });
  user.password = user.encryptPassword(body.password);
  user.save().then((user) => {
    res.send(user);
  }).catch((e) => {
    res.status(404).send();
  });
});
// Perform the login
// get users
router.get('/users/me', userAuthenticated, (req, res) => {
  res.send(req.user);
});

router.get('/users', userAuthenticated, (req, res) => {
  Users.find().then((user) => {
    res.send({ user });
  }, (e) => {
    res.status(400).send(e);
  });
});

// POST login
router.post('/login', (req, res, next) => {

  passport.authenticate('local', (err, user) => {

    if(err) return err;
    req.logIn(user, function(err) {
      if (err) { return err; }
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

router.delete('/users/me/token', userAuthenticated, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send();
  })
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

router.get('/logout', userAuthenticated, (req, res) => {

  req.logOut();
  res.status(200).send();

});

// GET add_post
router.get('/posts/create', userAuthenticated, (req, res) => {
  res.render('admin/add_post');
});

// posts post req
router.post('/posts/create', (req, res) => {
  var userId = req.user.id;
  var body = _.pick(req.body, ['title', 'status', 'content']);
  // form validation
  check('body.title').not().isEmpty().isLength({ min: 1 }).trim().withMessage('Title empty.');
  check('body.content').not().isEmpty().withMessage('Content is required').isLength({ min: 10 }).withMessage('Content should be greater than 20 words');


  //check errror
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(JSON.Stringify(errors));
  }
  else {
    var post = new Posts({
      title: body.title.trim(),
      content: body.content,
      status: body.status,
      _creatorID: req.user.id
    });
    Users.findOne({_id: userId}).then((userID) => {
      console.log(userID);
      post._creator = userID.firstname + " " + userID.lastname;
    });
    post.slug = slugify(body.title);
    Posts.findOne({ title: body.title }).then((some) => {
      if (some) {
        req.send('Title already exist');
      }
      else {
        post.save().then((doc) => {
          console.log(doc);
          req.send(doc);
        }, (e) => {
          res.status(404).send(e);
        });
      }
    });

  }
});

// posts get req
// router.get('/posts', userAuthenticated, (req, res) => {
//   Posts.find({ _creatorID: req.user.id }).then((posts) => {
//     res.render('admin/list_posts', {posts});

//     // res.send(posts);
//   }, (e) => {
//     res.status(400).send(e);
//   });
// });

router.get('/posts', (req, res) => {
  Posts.find().then((posts) => {
    res.send(posts);
  }, (e) => {
    res.status(400).send(e);
  });
});


// posts find by id
router.get('/posts/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;
  console.log(id);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Posts.findOne({ _id: id, _creatorID: req.user.id }).then((post) => {
    if (!post) {
      res.status(404).send();
    }
    res.send({ post });
  }).catch((e) => {
    res.status(404).send();
  });
});

// Delete Posts
router.post('/posts/delete/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndRemove({ _id: id, _creatorID: req.user.id }).then((post) => {
    if (!post) {
      res.status(404).send();
    }
    req.flash('success_message', 'successfully deleted post');
    res.redirect('/admin/posts');
  }).catch((e) => {
    res.status(404).send();
  });
});

// Update posts
// GET post/edit
router.get('/posts/edit/:id', userAuthenticated, (req, res) => {
  Posts.findOne({ _id: req.params.id, _creatorID: req.user.id }).then((post) => {
    res.render('admin/edit_post', { post });
  });
});
// POST post/edit
router.post('/posts/edit/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['title', 'status', 'slug', 'content']);
  body.title = body.title.trim();
  body.slug = slugify(body.title);
  if (ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndUpdate({ _id: id, _creatorID: req.user.id }, { $set: body }, { new: true }).then((post) => {
    if (!post) {
      res.status(404).send();
    }
    req.flash('success_message', 'successfully updated post');
    res.redirect('/admin/posts');
  }).catch((e) => {
    res.status(404).send();
  });
});

router.post('/like', userAuthenticated, (req, res) => {
  Posts.hitLikes();
});


module.exports = router;