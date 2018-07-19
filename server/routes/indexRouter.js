const express = require("express");
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const {ObjectID} = require('mongodb');
const multer = require("multer");
const upload = multer({dest: 'public/uploads/'})
const {Posts} = require('./../models/posts');
const {userAuthenticated} = require("./../middleware/auth/authenticate");
const _ = require('lodash');

// passport things
const passport = require("passport");

// ckeditor initialization
// const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
// ClassicEditor
//         .create( document.querySelector( '#content' ) )
//         .then( editor => {
//                 window.editor = editor;
//         } )
//         .catch( err => {
//                 console.error( err.stack );
//         } );


router.all('/*', (req, res, next) => {
  
  req.app.locals.layout = 'main';
  next();
  
});


// index req
router.get('/', (req, res)=> {
  Posts.findOne().then((posts) => {
    res.render('home/index', {
    post: posts,
    title: "YouWroteIt- A blogging platform for geeky people.."
  });
  });

});


// find post by title
// router.get('/:title', (req, res) => {
//   var title = req.params.title;
//   console.log(title);

//   Posts.findOne({title: title}).then((post) => {
//     if (!post) {
//       res.status(404).send();
//     }
//     res.send({post});
//   }).catch((e) => {
//     res.status(404).send();
//   });
// });



module.exports = router;
