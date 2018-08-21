const express = require("express");
const router = express.Router();
const { userAuthenticated } = require("./../middleware/auth/authenticate");
const slugify = require("slugify");
const { check, validationResult } = require("express-validator/check");
const { Posts } = require("./../models/posts");
const { Users } = require("./../models/users");
const { ObjectID } = require("mongodb");

const _ = require("lodash");

router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

// GET add_post
router.get("/create", (req, res) => {
  res.render("admin/add_post");
});

router.get("/", (req, res) => {
  Posts.find().then(
    posts => {
      res.send(posts);
    },
    e => {
      res.status(400).send(e);
    }
  );
});
router.get("/list", (req, res) => {
  Posts.find().then(
    posts => {
      res.render("admin/list_posts", { posts });
    },
    e => {
      res.status(400).send(e);
    }
  );
});
// posts find by slug
router.get("/:slug", (req, res) => {
  var slug = req.params.slug;

  Posts.findOne({ slug: slug, _creatorID: req.user.id })
    .then(post => {
      if (!post) {
        res.status(404).send();
      }
      res.send({ post });
    })
    .catch(e => {
      res.status(404).send();
    });
});
// GET post/edit
router.get("/edit/:slug", (req, res) => {
  Posts.findOne({ slug: req.params.slug, _creatorID: req.user.id }).then(
    post => {
      res.render("admin/edit_post", { post });
    }
  );
});
// posts post req
router.post("/create", (req, res) => {
  var userId = req.user.id;
  var body = _.pick(req.body, ["title", "status", "content"]);
  // form validation
  check("body.title")
    .not()
    .isEmpty()
    .isLength({ min: 1 })
    .trim()
    .withMessage("Title empty.");
  check("body.content")
    .not()
    .isEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content should be greater than 20 words");

  //check errror
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(JSON.Stringify(errors));
  } else {
    var post = new Posts({
      title: body.title.trim(),
      content: body.content,
      status: body.status,
      _creatorID: req.user.id
    });
    Users.findOne({ _id: userId }).then(userID => {
      console.log(userID);
      post._author = userID.firstname + " " + userID.lastname;
    });
    post.slug = slugify(body.title).toLowerCase();
    Posts.findOne({ title: body.title }).then(some => {
      if (some) {
        req.send("Title already exist");
      } else {
        post.save().then(
          doc => {
            console.log(doc);
            res.send(doc);
          },
          e => {
            res.status(404).send(e);
          }
        );
      }
    });
  }
});

// posts get req
// router.get('/posts', userAuthenticated, (req, res) => {
//   Posts.find({ _creatorID: req.user.id }).then((posts) => {
//     res.render('admin/list_posts', {posts});

//     // res.send(posts);
//   }, (e) => {
//     res.status(400).send(e);
//   });
// });

// Delete Posts
router.post("/delete/:slug", userAuthenticated, (req, res) => {
  var slug = req.params.slug;

  Posts.findOneAndRemove({ slug: slug, _creatorID: req.user.id })
    .then(post => {
      if (!post) {
        res.status(404).send();
      }
      req.flash("success_message", "successfully deleted post");
      res.redirect("/admin/posts");
    })
    .catch(e => {
      res.status(404).send();
    });
});

// Update posts

// POST post/edit
router.post("/edit/:id", userAuthenticated, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["title", "status", "slug", "content"]);
  body.title = body.title.trim();
  body.slug = slugify(body.title).toLowerCase();
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Posts.findOneAndUpdate(
    { _id: id, _creatorID: req.user.id },
    { $set: body },
    { new: true }
  )
    .then(post => {
      if (!post) {
        res.status(404).send();
      }
      req.flash("success_message", "successfully updated post");
      res.redirect("/admin");
    })
    .catch(e => {
      res.status(404).send();
    });
});

router.post("/like", userAuthenticated, (req, res) => {
  Posts.hitLikes();
});

module.exports = router;
