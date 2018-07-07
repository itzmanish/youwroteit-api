const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
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
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject =user.toObject();
  
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () { 
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'iskenichebamhai').toString();
  
  user.tokens.push({access, token});
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;
  
  try {
    decoded = jwt.verify(token, 'iskenichebamhai');
  } catch (e) {
    return Promise.reject();
  }
  
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
  
};

UserSchema.pre('save', function(next) {
  var user = this;
  console.log(user.isModified('password'));
  if(!user.isModified('password')) return  next();
  

      bcrypt.hash(user.password, 10, function(err, hash) {
        user.password = hash;
        next();
      });

});
var Users = mongoose.model('Users', UserSchema);

module.exports = {Users};
