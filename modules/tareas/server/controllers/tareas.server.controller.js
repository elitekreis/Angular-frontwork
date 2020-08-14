'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Tarea = mongoose.model('Tarea'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
exports.create = function(req, res) {
	var tarea = new Tarea(req.body);
	tarea.user = req.user;

	tarea.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(tarea);
		}
	});
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.tarea);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
	var tarea = req.tarea;

	tarea.realizado = req.body.realizado;
	tarea.deleted = req.body.deleted;

	tarea.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(tarea);
		}
	});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	var tarea = req.tarea;

	tarea.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(tarea);
		}
	});
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Tarea.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('usuario', 'displayName')
		.exec(function(err, tareas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(tareas);
			}
		});
	}
	else{
		Tarea.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('usuario', 'displayName')
		.exec(function(err, tareas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(tareas);
			}
		});
	}	
};

/**
 * Article middleware
 */
exports.tareaByID = function(req, res, next, id) {
	Tarea.findById(id)
	.populate('user', 'displayName')
	.populate('usuario', 'displayName')
	.exec(function(err, tarea) {
		if (err) return next(err);
		if (!tarea) return next(new Error('Failed to load tarea ' + id));
		req.tarea = tarea;
		next();
	});
};
