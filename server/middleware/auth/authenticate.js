// const { Users } = require("../../models/users");

// var authenticate = (req, res, next) => {
//     var token = req.session.token;
//     Users.findByToken(token).then((user) => {
//     if(!user) {
//       return Promise.reject();
//       }
//     req.user = user;
//     req.token = token;
//       next();
//   }).catch((e) => {
//     res.status(401).send();
//   });
// };
// var authenticate = ((req, res, next) => {
//   if (req.session.user && req.session.userId) {
//     return next();
//   } else {
//     next();
// }
// });

var userAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

module.exports = { userAuthenticated };
