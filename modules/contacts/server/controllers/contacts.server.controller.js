'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Contact = mongoose.model('Contact'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Contact
 */
exports.create = function(req, res) {
	var contact = new Contact(req.body);
	contact.user = req.user;

	contact.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(contact);
		}
	});
};

/**
 * Show the current Contact
 */
exports.read = function(req, res) {
	res.jsonp(req.contact);
};

/**
 * Update a Contact
 */
exports.update = function(req, res) {
	var contact = req.contact ;

	contact = _.extend(contact , req.body);

	contact.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(contact);
		}
	});
};

/**
 * Delete an Contact
 */
exports.delete = function(req, res) {
	var contact = req.contact ;
	contact.deleted = true;
	contact.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(contact);
		}
	});
};

/**
 * List of Contacts
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Contact.find({ enterprise: enterprise})
		.sort('-created')
		.populate('user')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.exec(function(err, contacts) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(contacts);
			}
		});
	} else {
		Contact.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.exec(function(err, contacts) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(contacts);
			}
		});
	};
	
};

/**
 * Contact middleware
 */
exports.contactByID = function(req, res, next, id) { 
	Contact.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('sub', 'name')
	.exec(function(err, contact) {
		if (err) return next(err);
		if (! contact) return next(new Error('Failed to load Contact ' + id));
		req.contact = contact ;
		next();
	});
};