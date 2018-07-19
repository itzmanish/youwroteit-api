const mongoose = require('mongoose');
const timestamps = require("mongoose-timestamp");
const PostSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  slug: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'public'
  },
  _creatorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _creator: {
    type: String,
    required: true
  }
});

PostSchema.plugin(timestamps);

var Posts = mongoose.model('Posts', PostSchema);

module.exports = {Posts};
