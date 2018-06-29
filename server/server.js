const express = require('express');
const _ = require('lodash');
const app = express();
const BodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Users} = require('./models/users');
const {Posts} = require('./models/posts');

app.use(BodyParser.json());

// posts post req
app.post('/posts', (req,res) => {
  var post = new Posts({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(404).send(e);
  });
});

// posts get req
app.get('/posts', (req,res) => {
  Posts.find().then((posts) => {
    res.send({posts});
  }, (e) =>{
    res.status(400).send(e);
  });
});

// posts find by id
app.get('/posts/:id', (req, res) => {
  var id = req.params.id
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
app.delete('/posts/:id', (req, res) => {
  var id = req.params.id

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
app.patch('/posts/:id', (req, res) => {
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
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['fname', 'lname', 'email', 'password']);
  var user = new Users(body);
  user.save().then((user) => {
    res.send(user);
  }).catch((e) => {
    res.status(404).send();
  });
});

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
