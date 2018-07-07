const bcrypt = require("bcryptjs");
var user = {
  name: 'hvhj',
  password: 'hjggu'
};

  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash('user.password', salt, function(err, hash) {
        console.log(hash);
  });
});
