'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Puesto = mongoose.model('Puesto'),
	Empleado = mongoose.model('Empleado'),
	User = mongoose.model('User');

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object

	// Init Variables
	var user = new User(req.body);

	// Add missing user fields
	user.provider = 'local';
	switch(user.roles[0]) {
		case 'cliente':
	        user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					user.password = undefined;
					user.salt = undefined;
					delete req.body.roles;
					res.json(user);
				}
			});
	        break;
	    default:   
	    	user.displayName = user.firstName + ' ' + user.lastName; 
	    	if (user.puesto !== undefined) {
	    		ocuparPuesto(user);
	    	}	
    		user.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					crearEmpleado(user);
					// Remove sensitive data before login
					user.password = undefined;
					user.salt = undefined;
					delete req.body.roles;
					res.json(user);
				}
			});
	        break;
	}
};

function ocuparPuesto (user){
	puestoConId(user.puesto, function(puesto){
		puesto.personal = user._id.toString();
		puesto.estado = 'Ocupado';
		puesto.save(function(err) {
			if (err) {
				console.log("puesto guardado error: ", err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log('puesto actualizado ok');
			}
		});
	});
}

function crearEmpleado(user) {
	var e = new Empleado();
	e.userLogin = user._id;
	e.enterprise = user.enterprise;
	e.puesto = user.puesto;
	e.sueldo = user.sueldo;
	e.created = Date.now();
	e.save(function(err) {
		if (err) {
			console.log(err, 'error create e');
			return 1;
		} else {
			console.log('todo piola');
		}
	});	
}

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		console.log(user);
		if (err || !user) {
			//console.log('passport');
			res.status(400).send(info);

		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					console.log('user');
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery)
		.populate('enterprise')
		.exec(function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							profileImageURL: providerUserProfile.profileImageURL,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};

//retorna un pusto con id
function puestoConId(id, callback){
	Puesto.findById(id)
	.populate('user', 'displayName')
	.populate('procesos', 'name')
	.populate('parent', 'name')
	.populate('proceso', 'name')
	.populate('personal', 'displayName')
	.populate('enterprise', 'name')
	.populate('area', 'name')
	.populate('puesto', 'name')
	.populate('interaccion', 'name')
	.populate('procedimientos', 'name description')
	.exec(function(err, puesto) {
		if (!err) {
			//console.log('[ok] -> ', puesto);
			return callback(puesto);
		} else {
			console.log("[err] ->", err);
		}
	});
}
