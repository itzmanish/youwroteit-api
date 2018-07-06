var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const {Users} = require('./../models/users');


var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
//   var user = users[_.findIndex(users, {id: jwt_payload.id})];
  Users.findById(jwt_payload.id).then((user) => {
     if (user) {
    next(null, user);
  } else {
    next(null, false); 
  }});
});

passport.use(strategy);