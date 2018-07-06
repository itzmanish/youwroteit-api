const express = require("express");
const router = express.Router();
const {ObjectID} = require('mongodb');
const multer = require("multer");
const upload = multer({dest: '/public/uploads/'})
const {Posts} = require('./../models/posts');
const {Users} = require('./../models/users');
const _ = require('lodash');
// passport things
import passport from 'passport';

// ckeditor initialization
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
ClassicEditor
        .create( document.querySelector( '#content' ) )
        .then( editor => {
                window.editor = editor;
        } )
        .catch( err => {
                console.error( err.stack );
        } );


const env = {
  AUTH0_CLIENT_ID: 'c1qEH2U7ZcAkwW_3c_ETSW7pATHesO-m',
  AUTH0_DOMAIN: 'genisys.auth0.com',
  AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
};


// index req
router.post('/', (req, res)=> {
  res.send('homepage');
});


// posts post req
router.post('/posts', upload.single('avatar'), (req,res) => {
  var post = new Posts({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
    postTime: new Date()
  });
  if (req.file) {
    var avatar = req.file.filename;
  } else {
    var avatar = 'default.jpg';
  }
  
  // form validation
  req.checkBody('title', 'title field is requied').notEmpty();
  req.checkBody('content', 'Content is required').notEmpty();
  
  //check errror
  var errors = req.validationErrors();
  
  if (errors) {
    res.render('/posts', {
      'errors': errors
    })
  } else {
    post.save().then((doc) => {
    req.flash('success', 'Post added');
    res.send(doc);
    res.location('/');
    res.redirect('/');
  }, (e) => {
    res.status(404).send(e);
  });
  }
});

// posts get req
router.get('/posts', (req,res) => {
  Posts.find().then((posts) => {
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
router.get('/posts/:id', (req, res) => {
  var id = req.params.id;
  console.log(id);
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Posts.findById(id).then((post) => {
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
  Posts.findByIdAndRemove(id).then((post) => {
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
  Posts.findByIdAndUpdate(id, {$set: body}, {new: true}).then((post) => {
    if(!post){
      res.status(404).send();
    }
    res.send({post});
  }).catch((e) => {
    res.status(404).send();
  });
});


// post users
router.post('/users', (req, res) => {
  var body = _.pick(req.body, ['fname', 'lname', 'email', 'password']);
  var user = new Users(body);
  user.save().then((user) => {
    res.send(user);
  }).catch((e) => {
    res.status(404).send();
  });
});
// disabled front end for some time
// Perform the login



module.exports = router;
