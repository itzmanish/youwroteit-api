const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const { ObjectID } = require('mongodb');
const { Users } = require('./../models/users');
const {Posts} = require('./../models/posts');
const { userAuthenticated } = require("./../middleware/auth/authenticate");
const _ = require('lodash');
const passport = require("passport");
require("./../lib/auth/passport");

router.all('/*', (req, res, next) => {

  req.app.locals.layout = 'admin';
  next();

});



router.get('/', userAuthenticated, (req, res) => {
  res.render('admin/index', {user: req.user.firstname, title: 'Youwroteit-Admin panel'});
});


// get signup
router.get('/signup', (req, res) => {
  res.render('layouts/signup', {layout: 'signup.handlebars'});
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
    req.flash('success_message', 'User signed up successfully');
    res.redirect('/admin');
  }).catch((e) => {
    req.flash('error_message', e.message);
    res.redirect('/admin/signup');
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

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/admin');
  }
  res.render('layouts/login', {layout: 'login.handlebars'});
});

// POST login
router.post('/login', (req, res, next)=>{


    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true

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

router.delete('/users/me/token', (req, res) => {
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

router.get('/logout', userAuthenticated, (req, res)=>{

    req.logOut();
    res.redirect('/admin/login');

});

// GET add_post
router.get('/posts/create', userAuthenticated, (req, res) => {
  res.render('admin/add_post');
});

// posts post req
router.post('/posts/create', (req, res) => {
  
    var body = _.pick(req.body, ['title', 'status', 'content']);
  console.log(req.body);
// form validation
  check('title').not().isEmpty().isLength({ min: 1 }).trim().withMessage('Title empty.');
  check('content').not().isEmpty().withMessage('Content is required').isLength({min: 10}).withMessage('Content should be greater than 20 words');
  
  
  //check errror
 const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    res.send(JSON.Stringify(errors));
  } else {
    var post = new Posts({
    title: body.title,
    content: body.content,
    status: body.status,
    postTime: new Date(),
    _creator: req.user.id
  });
  console.log(body.title, body.content);
    post.save().then((doc) => {
    req.flash('success_message', 'Post added');
    res.redirect('/admin/posts');
  }, (e) => {
    res.status(404).send(e);
  });
}});

// posts get req
router.get('/posts', userAuthenticated, (req,res) => {
  Posts.find({_creator: req.user.id}).then((posts) => {
    res.render('admin/list_posts', {posts});
  }, (e) =>{
    res.status(400).send(e);
  });
});


// posts find by id
router.get('/posts/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;
  console.log(id);
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Posts.findOne({_id: id, _creator: req.user.id}).then((post) => {
    if (!post) {
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});

// Delete Posts
router.delete('/posts/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndRemove({_id: id, _creator: req.user.id}).then((post) => {
    if(!post) {
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});

// Update posts
router.patch('/posts/edit/:id', userAuthenticated, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['title', 'slug', 'content']);
  if(ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndUpdate({_id: id, _creator: req.user.id}, {$set: body}, {new: true}).then((post) => {
    if(!post){
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});


module.exports = router;