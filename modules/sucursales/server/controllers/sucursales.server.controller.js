'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Sucursal = mongoose.model('Sucursal'),
	Caja = mongoose.model('Caja'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var sucursal = new Sucursal(req.body);
	sucursal.user = req.user;

	sucursal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(sucursal);
		}
	});
};

/**
 * Show the current sucursal
 */
exports.read = function(req, res) {
	res.jsonp(req.sucursal);
};

/**
 * Update a sucursal
 */
exports.update = function(req, res) {
	var sucursal = req.sucursal ;

	sucursal = _.extend(sucursal , req.body);

	sucursal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(sucursal);
		}
	});
};

/**
 * Delete an sucursal
 */
exports.delete = function(req, res) {
	var sucursal = req.sucursal ;
	sucursal.deleted = true;
	sucursal.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			sucursal.cajas.forEach(function (entry, entrykey) {
				var caja = entry;
				caja.deleted=true;
				caja.puestos = [];
				caja.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} 
					});
			});
			res.jsonp(sucursal);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Sucursal.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('cajas', 'name descripcion')
		.exec(function(err, sucursales) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(sucursales);
			}
		});
	}	
	else{
		Sucursal.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('cajas', 'name descripcion')
		.exec(function(err, sucursales) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(sucursales);
			}
		});
	}
};

/**
 * Comprobante middleware
 */
exports.sucursalByID = function(req, res, next, id) { 
	Sucursal.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('puestos', 'name')
	.populate('cajas', 'name descripcion total efectivo cheques credito debito dolares')
	.exec(function(err, sucursal) {
		if (err) return next(err);
		if (! sucursal) return next(new Error('Failed to load sucursal ' + id));
		req.sucursal = sucursal ;
		next();
	});
};