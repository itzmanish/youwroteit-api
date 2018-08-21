const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
var UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstname: {
    type: String,
    required: true,
    minlength: 2
  },
  lastname: {
    type: String,
    required: true,
    minlength: 2
  }
});

UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var token = jwt
    .sign({ _id: user._id.toHexString() }, "iskenichebamhai", {
      expiresIn: 86400
    })
    .toString();
  console.log(user.token);
  user.save();
};

UserSchema.methods.removeToken = function(token) {
  var user = this;
  return user.delete({
    token: null
  });
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, "iskenichebamhai");
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    token: token
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;
  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compareSync(password, user.password, (err, res) => {
        console.log(res);
        if (res) {
          resolve(user);
        }
        reject();
      });
    });
  });
};

// UserSchema.statics.authentication = function(email, password, callback) {
//   return Users.findOne({ email }).then(function(err, user) {
//     if (err) {
//       return callback(err);
//     } else if (!user) {
//       err = new Error("User not found.");
//       err.status = 401;
//       return callback(err);
//     }
//     bcrypt.compare(password, user.password, function(err, result) {
//       if (result === true) {
//         return callback(null, user);
//       } else {
//         return callback();
//       }
//     });
//   });
// };
UserSchema.pre("save", function(next) {
  var user = this;
  console.log(user.isModified("password"));
  if (user.isModified("password")) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var Users = mongoose.model("Users", UserSchema);

module.exports = { Users };
