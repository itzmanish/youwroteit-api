const mongoose = require('mongoose');

var Posts = mongoose.model('Posts', {
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  },
  postTime: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Posts};
