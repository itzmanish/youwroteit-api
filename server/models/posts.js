const mongoose = require('mongoose');
const URLSlugs = require("mongoose-url-slugs");
const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'public'
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

var Posts = mongoose.model('Posts', PostSchema);


PostSchema.plugin(URLSlugs('title', {field: 'slug'}));

module.exports = {Posts};
