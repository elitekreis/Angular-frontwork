'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	HistorialCompras = mongoose.model('HistorialCompras'),
	Moment = require('moment'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/**
 * Create a HistorialCompra
 */
exports.create = function(req, res) {
	var historialCompra = new HistorialCompras(req.body);
	historialCompra.compra = req.body.compra;
	historialCompra.modificadoPor = req.user._id;
	historialCompra.save(function(err) {
		if (err) {
			console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('se creo el historial de compra');
			res.jsonp(historialCompra);
		}
	});
};

/**
 * Show the current Compra
 */
exports.read = function(req, res) {
	res.jsonp(req.historialCompra);
};

/**
 * Update a Compra
 */
exports.update = function(req, res) {
	var historialCompra = req.historialCompra ;

	historialCompra = _.extend(historialCompra , req.body);

	historialCompra.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(historialCompra);
		}
	});
};

/**
 * Delete an Compra
 */
exports.delete = function(req, res) {
	var historialCompra = req.historialCompra ;
	historialCompra.deleted = true;
	historialCompra.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(historialCompra);
		}
	});
};

/**
 * List of Compras
 */
exports.list = function(req, res) { 
	HistorialCompra.find()
		.sort('-created')
		.populate('modificadoPor', 'name')
		.exec(function(err, historialCompras) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(historialCompras);
			}
		});
};

exports.historialByID = function(req, res, next, id) {
	 HistorialCompra.findById(id)
	 .populate('modificadoPor', 'name')
	 .exec(function(err, compra) {
		if (err) return next(err);
		if (! compra) return next(new Error('Failed to load Historial Compra ' + id));
		req.compra = compra ;
		next();
	});
};