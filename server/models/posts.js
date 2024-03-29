const mongoose = require("mongoose");
const Users = require("./users");
const timestamps = require("mongoose-timestamp");
const PostSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true
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
    default: "public"
  },
  _creatorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _author: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Users
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Users
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

PostSchema.plugin(timestamps);

PostSchema.methods.hitLikes = function() {
  this.likes++;
};

PostSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    title: this.title,
    body: this.body,
    slug: this.slug,
    author: this._author,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

var Posts = mongoose.model("Posts", PostSchema);

module.exports = { Posts };
