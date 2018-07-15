/*
 * Middleware function to check if the user is logged in
 */
const { ObjectID } = require('mongodb');
const {Users} = require('./../../models/users');
const isAuthenticated = {};
isAuthenticated.isLogedIn = ((req, res, next) => {
    if (!ObjectID.isValid(req.user._id)) {
        return res.status(404).send();
    }
    
    if (req.user && req.user != 'NULL') {
        next();
    }
    else {
        res.redirect('/admin/login');
    }

});
isAuthenticated.whichUser = ((req, res, next) => {
	if(req.session && req.session.user){
		// lookup the user in the DB by pulling their email from the session
		Users.findOne({'_id':req.session.userId}, function(err, user){
			if(err){
				res.redirect('/login');
			}
			if(!user){
				req.session.reset();
				res.redirect('/login');
			} else{
				req.user = user.firstname;
				req.session.user = user.firstname;
				// expose the user to the template
				res.locals.user = user.firstname;
				next();
			}
		});
	} else {
		next();
	}
});

module.exports = isAuthenticated ;



