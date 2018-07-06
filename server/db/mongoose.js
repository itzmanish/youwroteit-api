const mongoose = require('mongoose');
const mongodb = require("mongodb");
const config = require('../config/config');

mongoose.Promise = global.Promise;
mongoose.connect(config.DbUrl);

module.exports = {mongoose};
