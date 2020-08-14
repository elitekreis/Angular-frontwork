'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/api/users/me').get(users.me);
	app.route('/api/users/byId')
		.get(users.findUserById);
	app.route('/api/users')
		.all()
		.get(users.list)
		.put(users.update);
	app.route('/api/users/changeStatus')
		.get(users.changeStatus);
	app.route('/api/users/changePuesto')
		.post(users.changePuesto);
	app.route('/api/users/accounts').delete(users.removeOAuthProvider);
	app.route('/api/users/password').post(users.changePassword);
	app.route('/api/users/picture').post(users.changeProfilePicture);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);

};
