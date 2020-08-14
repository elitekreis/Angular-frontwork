'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			
			User.findOne({
				username: username
			})
			.populate('enterprise')
			.exec(function(err, user) {
				
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Usuario desconocido'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Contraseña incorrecta'
					});
				}
				if (user.status !== 'active') {
					return done(null, false, {
						message: 'El usuario no se encuentra activo, pongase en contacto con el administrador'
					});
				}

				return done(null, user);
			});
		}
	));
};