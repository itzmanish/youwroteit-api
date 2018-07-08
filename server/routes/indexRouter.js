const express = require("express");
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const {ObjectID} = require('mongodb');
const multer = require("multer");
const upload = multer({dest: 'public/uploads/'})
const {Posts} = require('./../models/posts');
const {Users} = require('./../models/users');
const {authenticate} = require("./../middleware/auth/authenticate");
const _ = require('lodash');

// passport things
const passport = require("passport");

// ckeditor initialization
// const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
// ClassicEditor
//         .create( document.querySelector( '#content' ) )
//         .then( editor => {
//                 window.editor = editor;
//         } )
//         .catch( err => {
//                 console.error( err.stack );
//         } );


// const env = {
//   AUTH0_CLIENT_ID: 'c1qEH2U7ZcAkwW_3c_ETSW7pATHesO-m',
//   AUTH0_DOMAIN: 'genisys.auth0.com',
//   AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
// };


// index req
router.get('/', (req, res)=> {
  res.render('home/index', {
    title: "Home",
    helpers: {
            currentYear: function () { return new Date().getFullYear(); }
        }
  });
});


// posts post req
router.post('/posts', authenticate, (req,res) => {
  
// form validation
  check('title').not().isEmpty().isLength({ min: 1 }).trim().withMessage('Title empty.');
  check('content').not().isEmpty().withMessage('Content is required').isLength({min: 10}).withMessage('Content should be greater than 20 words');
  
  
  //check errror
 const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    res.send(JSON.Stringify(errors));
  } else {
    console.log(req.user);
    var post = new Posts({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
    postTime: new Date(),
    _creator: req.user._id
  });
    post.save().then((doc) => {
    // req.flash('messages', 'Post added');
    res.send(doc);
  }, (e) => {
    res.status(404).send(e);
  });
}});

// posts get req
router.get('/posts', authenticate, (req,res) => {
  Posts.find({_creator: req.user._id}).then((posts) => {
    res.send({posts});
  }, (e) =>{
    res.status(400).send(e);
  });
});

// find post by title
// router.get('/:title', (req, res) => {
//   var title = req.params.title;
//   console.log(title);

//   Posts.findOne({title: title}).then((post) => {
//     if (!post) {
//       res.status(404).send();
//     }
//     res.send({post});
//   }).catch((e) => {
//     res.status(404).send();
//   });
// });


// posts find by id
router.get('/posts/:id', authenticate, (req, res) => {
  var id = req.params.id;
  console.log(id);
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Posts.findOne({_id: id, _creator: req.user._id}).then((post) => {
    if (!post) {
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});

// Delete Posts
router.delete('/posts/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndRemove({_id: id, _creator: req.user._id}).then((post) => {
    if(!post) {
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});

// Update posts
router.patch('/posts/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['title', 'slug', 'content']);
  if(ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((post) => {
    if(!post){
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});


// post users
router.post('/signup', (req, res) => {
  var body = _.pick(req.body, ['name', 'email', 'password']);
  var user = new Users({
    email: body.email.toLowerCase(),
    name: body.name,
    password: body.password
  });
  user.save().then((user) => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(404).send();
  });
});
// disabled front end for some time
// Perform the login
// get users
router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

router.get('/users', (req,res) => {
  Users.find().then((user) => {
    res.send({user});
  }, (e) =>{
    res.status(400).send(e);
  });
});


router.post('/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  Users.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) =>{
    res.status(400).send();
  })
});

module.exports = router;
