const express = require("express");
const router = express.Router();
const { ObjectID } = require('mongodb');
const { userAuthenticated } = require("./../middleware/auth/authenticate");

const { check, validationResult } = require('express-validator/check');
const {Posts} = require('./../models/posts');

router.all('/*', (req, res, next) => {

  req.app.locals.layout = 'admin';
  next();

});

// posts get req
router.get('/posts',  (req,res) => {
  Posts.find({_creator: req.user.id}).then((posts) => {
    res.render('admin/list_post', {posts});
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
router.delete('/posts/:id', (req, res) => {
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
router.patch('/posts/edit/:id', (req, res) => {
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

// GET add_post
router.get('/posts/create', userAuthenticated, (req, res) => {
  res.render('admin/add_post');
});

// posts post req
router.post('/posts/create', (req,res) => {
  
// form validation
  check('title').not().isEmpty().isLength({ min: 1 }).trim().withMessage('Title empty.');
  check('content').not().isEmpty().withMessage('Content is required').isLength({min: 10}).withMessage('Content should be greater than 20 words');
  
  
  //check errror
 const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    res.send(JSON.Stringify(errors));
  } else {
    var post = new Posts({
    title: req.body.title,
    content: req.body.content,
    status: req.body.status,
    slug: req.body.title.replace(/\s+/g, '-').toLowerCase(),
    postTime: new Date(),
    _creator: req.userId
  });
    post.save().then((doc) => {
    req.flash('success_message', 'Post added');
    res.send(doc);
  }, (e) => {
    res.status(404).send(e);
  });
}});

module.exports = router;