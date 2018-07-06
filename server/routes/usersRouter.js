const express = require("express");
const router = express.Router();
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const {Users} = require('./models/users');

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

module.exports = router;