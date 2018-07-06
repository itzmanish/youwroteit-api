const mongoose = require('mongoose');
const validator = require('validator');
var UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not valid email'
  }},
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    tokens: {
      type: String,
      required: true
    }
  }]
});

var Users = mongoose.model('Users', UserSchema);

module.exports = {Users};
